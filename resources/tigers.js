// const tigersClaimAddress = ""; // MAIN NET
const tigersClaimAddress = "0xf8aC099eE981DD077a54761aE6e69C75BC618412"; // TEST NET GOERLI
//   const tigerAddress = "0x61028F622CB6618cAC3DeB9ef0f0D5B9c6369C72"; // MAIN NET
const tigerAddress = "0xa2ec462e0Fa83b5A33e48399E0788c2640edf0cD"; // TEST NET GOERLI

// get buttons
const connectButton = document.getElementById("connect-button");
const claimWalletBtn = document.getElementById("claim-wallet");
const claimForgedBtn = document.getElementById("claim-forge");
const claimCheckBtn = document.getElementById("check-claimed");

let newTigerContract;
let tigerContract;
let account;

window.addEventListener("load", (event) => {
  if (window.ethereum) {
    // activate claim check button
    claimCheckBtn.classList.remove("empty");
    claimCheckBtn.textContent = "check";
    claimCheckBtn?.addEventListener("click", (e) => {
      claimCheck(e);
    });

    window.web3 = new Web3(window.ethereum);
    forgeContract = new window.web3.eth.Contract(tigerAbi, tigerAddress);
    newTigerContract = new web3.eth.Contract(newTigerAbi, tigersClaimAddress);

    connectButton?.addEventListener("click", (e) => {
      connect(e);
    });
  } else {
    connectButton.textContent = "web3 not supported";
  }
});

/* To connect using MetaMask */
async function connect(e) {
  const button = e.target;
  connectButton.classList.add("button--loading");
  button.textContent = "loading...";
  if (window.ethereum) {
    try {
      const accounts = await ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .catch((err) => {
          console.log(err.message);
          connectButton.classList.remove("button--loading");
          connectButton.textContent = "connect wallet";
        });
      if (accounts?.length > 0) {
        account = accounts[0];
        connectButton.removeEventListener("click", (e) => connect(e));

        await getOwned(account);
        await getForged(account);
        connectButton.classList.remove("button--loading");
        button.textContent = account.slice(0, 5) + "..." + account.slice(-4);
        window.location = "#claim";
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    button.textContent = "Please check browser";
  }
}

// get items in wallet and check if claimed already
async function getOwned(walletAddress) {
  // window.web3 = new Web3(window.ethereum);
  claimWalletBtn.classList.add("button--loading");
  const token_ids_lst = [];
  const claimedTokens = [];

  try {
    // get tigers
    const bal = await forgeContract.methods
      .balanceOf(walletAddress)
      .call()
      .catch();
    if (bal > 0) {
      for (let i = 0; i < bal; i++) {
        const id = await forgeContract.methods
          .tokenOfOwnerByIndex(walletAddress, i)
          .call()
          .catch((err) => console.log(err.message));
        // check if tokens are claimed already:
        const isClaimed = await newTigerContract.methods
          .apeClaimed(id)
          .call()
          .catch((err) => console.log(err.message));
        // console.log(isClaimed);
        if (isClaimed === "0") {
          token_ids_lst.push(+Number(id));
        } else {
          claimedTokens.push(+Number(id));
        }
      }

      if (token_ids_lst?.length > 0) {
        claimWalletBtn.textContent = "CLAIM";
        claimWalletBtn.classList.remove("empty");
        claimWalletBtn.addEventListener("click", (e) =>
          vpassMint(
            token_ids_lst.sort((a, b) => a - b),
            false
          )
        );
      } else {
        claimWalletBtn.textContent = "nothing to claim";
        claimWalletBtn.classList.add("empty");
      }
    } else {
      claimWalletBtn.textContent = "nothing to claim";
      claimWalletBtn.classList.add("empty");
    }
    console.log("Owned: " + String(token_ids_lst));
  } catch (error) {
    console.log("error: " + error);
  }

  document.getElementById("wallet-text-underline").textContent =
    String(claimedTokens.length) + " Tiger(s) already claimed";

  document.getElementById("wallet-text").textContent =
    "You can claim " + String(token_ids_lst.length) + " Tiger(s)";

  claimWalletBtn.classList.remove("button--loading");

  return token_ids_lst;
}

// ___________________________________
// get forged items and spread the data
async function getForged(walletAddress) {
  claimForgedBtn.classList.add("button--loading");

  const url = "./resources/forged-tigers.json";
  let allforged = [];
  let claimable = [];
  let claimedTokens = [];

  const x = await fetch(url)
    .then((res) => res.json())
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        // handle the 404 error
        console.log("Resource not found:", error);
      } else {
        // handle other errors
        console.log("Error:", error);
      }
    });

  let a = web3.utils.toChecksumAddress(walletAddress);
  if (x) allforged = x[a]?.forged;
  for (let i = 0; i < allforged?.length; i++) {
    const isClaimed = await newTigerContract.methods
      .apeClaimed(allforged[i])
      .call()
      .catch((err) => console.log(err.message));
    // console.log(allforged[i], isClaimed);
    if (isClaimed === "0") {
      claimable.push(allforged[i]);
    } else {
      claimedTokens.push(allforged[i]);
    }
  }

  console.log("Forged: " + String(claimable));
  if (claimable?.length > 0) {
    claimForgedBtn.textContent = "CLAIM";
    claimForgedBtn.classList.remove("empty");
    claimForgedBtn.addEventListener("click", (e) =>
      vpassMint(
        claimable.sort((a, b) => a - b),
        true
      )
    );
  } else {
    claimForgedBtn.textContent = "nothing to claim";
  }

  document.getElementById("forge-text-underline").textContent =
    String(claimedTokens.length) + " Tiger(s) already claimed";

  document.getElementById("forge-text").textContent =
    "You can claim " +
    String(claimable ? claimable.length : 0) +
    " Forged Tigers";
  claimForgedBtn.classList.remove("button--loading");

  return claimable;
}

async function vpassMint(itemsToMint, claimingForged) {
  if (claimingForged) {
    claimForgedBtn.classList.add("button--loading");
  } else {
    claimWalletBtn.classList.add("button--loading");
  }

  var r = await Swal.fire({
    title: "<h1>Tigers Owned</h1>",
    html:
      "<h2>You are minting " +
      String(itemsToMint.length) +
      "</h2>" +
      "<h2> Typical Tigers</h2>" +
      "<h3>This will claim your Typical Tiger. You will receive a new mint. Your original" +
      " Tiger will be claimed &amp; no longer claimable.</h3>" +
      "<h2>You will pay gas mint each NFT.</h2>" +
      "<h3>Are you sure?</h3>",
    icon: "info",
    confirmButtonText: "<h4>Ok!</h4>",
    denyButtonText: "<h4>Nope</h4>",
    showDenyButton: true,
  });

  if (r.isDenied) {
    claimForgedBtn.classList.remove("button--loading");
    claimWalletBtn.classList.remove("button--loading");
    return;
  }

  claimApes(itemsToMint, claimingForged);

  console.log("Mint: " + String(itemsToMint));
}

async function claimApes(itemsToMint, areForged) {
  try {
    if (areForged) {
      await newTigerContract.methods
        .claimForgedApes(itemsToMint)
        .send({ from: account });
      await getForged(account);
    } else {
      await newTigerContract.methods
        .claimApes(itemsToMint)
        .send({ from: account });
      await getOwned(account);
    }
  } catch (error) {
    console.log("Error:", error);
    claimForgedBtn.classList.remove("button--loading");
    claimWalletBtn.classList.remove("button--loading");
    await Swal.fire({
      title: "Tigers NOT Claimed",
      html:
        "<h2>You FAILED to claim " +
        String(itemsToMint.length) +
        " Tigers</h2>",
      icon: "error",
      confirmButtonText: "<h4>No biggie!</h4>",
      showDenyButton: false,
    });
    return;
  }
  claimForgedBtn.classList.remove("button--loading");
  claimWalletBtn.classList.remove("button--loading");

  await Swal.fire({
    title: "Tigers Claimed",
    html: "<h2>You have claimed " + String(itemsToMint.length) + " Tigers</h2>",
    icon: "info",
    confirmButtonText: "<h4>The Adventure Begins!</h4>",
    showDenyButton: false,
  });
}

const claimCheck = async (e) => {
  e.preventDefault();
  const membership = document.getElementById("membership")?.value;
  if (!membership) return;
  try {
    const isClaimed = await newTigerContract.methods
      .apeClaimed(parseInt(membership))
      .call()
      .catch((err) => console.log(err.message));

    console.log(isClaimed);
    const claimed = isClaimed === "0" ? "<h5>not</h5>" : "<h6>already</h6>";

    await Swal.fire({
      title: "Check Check",
      html:
        "<h2>Tiger " +
        membership +
        "</h2>" +
        "<h1>Has</h1>" +
        "<h5>" +
        claimed +
        "</h5>" +
        "<h1> been claimed.</h1>",
      icon: "info",
      confirmButtonText: "<h4>Thanks!</h4>",
      showDenyButton: false,
    });
  } catch (error) {
    console.log(error.message);
  }
};
