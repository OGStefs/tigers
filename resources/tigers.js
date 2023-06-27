// const tigersClaimAddress = ""; // MAIN NET
const tigersClaimAddress = "0x0f1d3f03ACBdeff91695d33C9B59A6F6122fDc6e"; // TEST NET GOERLI
//   const tigerAddress = "0x61028F622CB6618cAC3DeB9ef0f0D5B9c6369C72"; // MAIN NET
const tigerAddress = "0x8580156166e7ae7c4a050821a8F2a03bcf9d2Ee9"; // TEST NET GOERLI
// const cubsClaimAddress = ""; // MAIN NET
const cubsClaimAddress = "0x1dE8209753409eb764Fb128721A33211c01cB1dA"; // TEST NET GOERLI
//   const cubAddress = "0x61028F622CB6618cAC3DeB9ef0f0D5B9c6369C72"; // MAIN NET
const cubAddress = "0x891D1e106c2357d0B84726C18411cCf87B5EB98B"; // TEST NET GOERLI

// get buttons
const connectButton = document.getElementById("connect-button");
const claimWalletBtn = document.getElementById("claim-wallet");
const claimForgedBtn = document.getElementById("claim-forge");
const claimCheckBtn = document.getElementById("check-claimed");
const claimWalletBtnCubs = document.getElementById("claim-wallet-cubs");
const claimForgedBtnCubs = document.getElementById("claim-forge-cubs");
const claimCheckBtnCubs = document.getElementById("check-claimed-cub");

let newTigerContract;
let tigerContract;
let newCubContract;
let cubContract;
let account;

window.addEventListener("load", (event) => {
  if (window.ethereum) {
    // activate claim check button
    claimCheckBtn.classList.remove("empty");
    claimCheckBtn.textContent = "check";
    claimCheckBtn?.addEventListener("click", (e) => {
      claimCheck(e);
    });
    claimCheckBtnCubs.classList.remove("empty");
    claimCheckBtnCubs.textContent = "check";
    claimCheckBtnCubs?.addEventListener("click", (e) => {
      claimCheckCubs(e);
    });

    window.web3 = new Web3(window.ethereum);
    tigerContract = new window.web3.eth.Contract(tigerAbi, tigerAddress);
    newTigerContract = new web3.eth.Contract(newTigerAbi, tigersClaimAddress);
    cubContract = new window.web3.eth.Contract(cubsAbi, cubAddress);
    newCubContract = new web3.eth.Contract(newCubsAbi, cubsClaimAddress);

    connectButton?.addEventListener("click", connect);

    connect();
  } else {
    connectButton.textContent = "web3 not supported";
  }
});

window.ethereum.on("chainChanged", (chainId) => window.location.reload());

/* To connect using MetaMask */
async function connect() {
  connectButton.classList.add("button--loading");
  connectButton.textContent = "loading...";

  if (window.ethereum.chainId != "0x5") {
    // TODO: change this to main net "0x1"
    connectButton.textContent = "wrong network!";
    connectButton.classList.remove("button--loading");
    return;
  }

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
        await getOwned(account);
        await getForged(account);

        await getOwnedCubs(account);
        await getForgedCubs(account);
        connectButton.classList.remove("button--loading");
        connectButton.textContent =
          account.slice(0, 5) + "..." + account.slice(-4);
        // window.location = "#claim";
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    button.textContent = "Please check browser";
  }
}

// get tiegrs in wallet and check if claimed already
async function getOwned(walletAddress) {
  // window.web3 = new Web3(window.ethereum);
  claimWalletBtn.classList.add("button--loading");
  const token_ids_lst = [];
  const claimedTokens = [];

  try {
    // get tigers
    const bal = await tigerContract.methods
      .balanceOf(walletAddress)
      .call()
      .catch();
    if (bal > 0) {
      for (let i = 0; i < bal; i++) {
        const id = await tigerContract.methods
          .tokenOfOwnerByIndex(walletAddress, i)
          .call()
          .catch((err) => console.log(err.message));
        // check if tokens are claimed already:
        const isClaimed = await newTigerContract.methods
          .isClaimed(id)
          .call()
          .catch((err) => console.log(err.message));
        // console.log(isClaimed);
        if (!isClaimed) {
          token_ids_lst.push(+Number(id));
        } else {
          claimedTokens.push(+Number(id));
        }
      }

      if (token_ids_lst?.length > 0) {
        claimWalletBtn.textContent = "CLAIM";
        claimWalletBtn.classList.remove("empty");
        claimWalletBtn.addEventListener("click", () =>
          mint(
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
    console.log("error: " + error.message);
  }

  document.getElementById("wallet-text-underline").textContent =
    String(claimedTokens.length) + " Tiger(s) already claimed";

  document.getElementById("wallet-text").textContent =
    "You can claim " + String(token_ids_lst.length) + " Tiger(s)";

  claimWalletBtn.classList.remove("button--loading");

  return token_ids_lst;
}

// get cubs in wallet and check if claimed already
async function getOwnedCubs(walletAddress) {
  // window.web3 = new Web3(window.ethereum);
  claimWalletBtnCubs.classList.add("button--loading");
  const token_ids_lst = [];
  const claimedTokens = [];

  try {
    // get cubs
    const bal = await cubContract.methods
      .getWalletOfOwner(walletAddress)
      .call()
      .catch();

    if (bal.length > 0) {
      for (let i = 0; i < bal.length; i++) {
        // check if tokens are claimed already:
        const isClaimed = await newCubContract.methods
          .isClaimed(bal[i])
          .call()
          .catch((err) => console.log(err.message));
        // console.log(isClaimed);
        if (!isClaimed) {
          token_ids_lst.push(bal[i]);
        } else {
          claimedTokens.push(bal[i]);
        }
      }

      if (token_ids_lst?.length > 0) {
        claimWalletBtnCubs.textContent = "CLAIM";
        claimWalletBtnCubs.classList.remove("empty");
        claimWalletBtnCubs.addEventListener("click", () =>
          mintCub(
            token_ids_lst.sort((a, b) => a - b),
            false
          )
        );
      } else {
        claimWalletBtnCubs.textContent = "nothing to claim";
        claimWalletBtnCubs.classList.add("empty");
      }
    } else {
      claimWalletBtnCubs.textContent = "nothing to claim";
      claimWalletBtnCubs.classList.add("empty");
    }
    console.log("Owned: " + String(token_ids_lst));
  } catch (error) {
    console.log("error: " + error.message);
  }

  document.getElementById("wallet-text-underline-cubs").textContent =
    String(claimedTokens.length) + " Cub(s) already claimed";

  document.getElementById("wallet-text-cubs").textContent =
    "You can claim " + String(token_ids_lst.length) + " Cub(s)";

  claimWalletBtnCubs.classList.remove("button--loading");

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
      .isClaimed(allforged[i])
      .call()
      .catch((err) => console.log(err.message));
    // console.log(allforged[i], isClaimed);
    if (!isClaimed) {
      claimable.push(allforged[i]);
    } else {
      claimedTokens.push(allforged[i]);
    }
  }

  console.log("Forged: " + String(claimable));
  if (claimable?.length > 0) {
    claimForgedBtn.textContent = "CLAIM";
    claimForgedBtn.classList.remove("empty");
    claimForgedBtn.addEventListener("click", () =>
      mint(
        claimable.sort((a, b) => a - b),
        true
      )
    );
  } else {
    claimForgedBtn.textContent = "nothing to claim";
    claimForgedBtn.classList.add("empty");
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

// ___________________________________
// get forged cubs and spread the data
async function getForgedCubs(walletAddress) {
  claimForgedBtnCubs.classList.add("button--loading");

  const url = "./resources/forged-cubs.json";
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
    const isClaimed = await newCubContract.methods
      .isClaimed(allforged[i])
      .call()
      .catch((err) => console.log(err.message));
    // console.log(allforged[i], isClaimed);
    if (!isClaimed) {
      claimable.push(allforged[i]);
    } else {
      claimedTokens.push(allforged[i]);
    }
  }

  console.log("Forged: " + String(claimable));
  if (claimable?.length > 0) {
    claimForgedBtnCubs.textContent = "CLAIM";
    claimForgedBtnCubs.classList.remove("empty");
    claimForgedBtnCubs.addEventListener("click", () =>
      mintCub(
        claimable.sort((a, b) => a - b),
        true
      )
    );
  } else {
    claimForgedBtnCubs.textContent = "nothing to claim";
    claimForgedBtnCubs.classList.add("empty");
  }

  document.getElementById("forge-text-underline-cubs").textContent =
    String(claimedTokens.length) + " Cubs(s) already claimed";

  document.getElementById("forge-text-cubs").textContent =
    "You can claim " +
    String(claimable ? claimable.length : 0) +
    " Forged Cubs";
  claimForgedBtnCubs.classList.remove("button--loading");

  return claimable;
}

async function mint(itemsToMint, claimingForged) {
  if (claimingForged) {
    claimForgedBtn.classList.add("button--loading");
  } else {
    claimWalletBtn.classList.add("button--loading");
  }

  let r = await Swal.fire({
    title: "<h1>Typical Tigers</h1>",
    html:
      "<h2>You are minting " +
      String(itemsToMint.length) +
      "</h2>" +
      "<h2> Typical Tiger(s)</h2>" +
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

async function mintCub(itemsToMint, claimingForged) {
  if (claimingForged) {
    claimForgedBtnCubs.classList.add("button--loading");
  } else {
    claimWalletBtnCubs.classList.add("button--loading");
  }

  let r = await Swal.fire({
    title: "<h1>Baby Cub Tigers</h1>",
    html:
      "<h2>You are minting " +
      String(itemsToMint.length) +
      "</h2>" +
      "<h2> Baby Cubs</h2>" +
      "<h3>This will claim your Baby Cub Tiger. You will receive a new mint. Your original" +
      " Cub will be claimed &amp; no longer claimable.</h3>" +
      "<h2>You will pay gas mint each NFT.</h2>" +
      "<h3>Are you sure?</h3>",
    icon: "info",
    confirmButtonText: "<h4>Ok!</h4>",
    denyButtonText: "<h4>Nope</h4>",
    showDenyButton: true,
  });

  if (r.isDenied) {
    claimForgedBtnCubs.classList.remove("button--loading");
    claimWalletBtnCubs.classList.remove("button--loading");
    return;
  }

  claimCubs(itemsToMint, claimingForged);

  console.log("Mint: " + String(itemsToMint));
}

async function claimApes(itemsToMint, areForged) {
  try {
    if (areForged) {
      await newTigerContract.methods
        .claimForgedTigers(itemsToMint)
        .send({ from: account });
      await getForged(account);
    } else {
      await newTigerContract.methods
        .claimTigers(itemsToMint)
        .send({ from: account });
      await getOwned(account);
    }
  } catch (error) {
    console.log("Error:", error.message);
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
    confirmButtonText: "<h4>Roar!</h4>",
    showDenyButton: false,
  });

  location.reload();
}

async function claimCubs(itemsToMint, areForged) {
  try {
    if (areForged) {
      await newCubContract.methods
        .claimForgedTigers(itemsToMint)
        .send({ from: account });
      await getForged(account);
    } else {
      await newCubContract.methods
        .claimTigers(itemsToMint)
        .send({ from: account });
      await getOwned(account);
    }
  } catch (error) {
    console.log("Error:", error.message);
    claimForgedBtnCubs.classList.remove("button--loading");
    claimWalletBtnCubs.classList.remove("button--loading");
    await Swal.fire({
      title: "Cubs NOT Claimed",
      html:
        "<h2>You FAILED to claim " +
        String(itemsToMint.length) +
        " Cubs(s)</h2>",
      icon: "error",
      confirmButtonText: "<h4>No biggie!</h4>",
      showDenyButton: false,
    });
    return;
  }
  claimForgedBtnCubs.classList.remove("button--loading");
  claimWalletBtnCubs.classList.remove("button--loading");

  await Swal.fire({
    title: "Cub(s) Claimed",
    html: "<h2>You have claimed " + String(itemsToMint.length) + " Cub(s)</h2>",
    icon: "info",
    confirmButtonText: "<h4>Meow!</h4>",
    showDenyButton: false,
  });
  location.reload();
}

const claimCheck = async (e) => {
  e.preventDefault();
  const tigerInput = document.getElementById("claimedTiger");
  const claimedTiger = tigerInput?.value;

  if (!claimedTiger) return;

  try {
    const isClaimed = await newTigerContract.methods
      .isClaimed(parseInt(claimedTiger))
      .call()
      .catch((err) => console.log(err.message));

    console.log(isClaimed);

    const claimed = !isClaimed ? "<h5>not</h5>" : "<h6>already</h6>";

    await Swal.fire({
      title: "Check Check",
      html:
        "<h2>Tiger " +
        claimedTiger +
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
  tigerInput.value = "";
};

const claimCheckCubs = async (e) => {
  e.preventDefault();
  const cubInput = document.getElementById("claimedCub");
  const claimedTiger = cubInput?.value;
  console.log(claimedTiger);
  if (!claimedTiger) return;

  try {
    const isClaimed = await newCubContract.methods
      .isClaimed(parseInt(claimedTiger))
      .call()
      .catch((err) => console.log(err.message));

    console.log(isClaimed);

    const claimed = !isClaimed ? "<h5>not</h5>" : "<h6>already</h6>";

    await Swal.fire({
      title: "Check Check",
      html:
        "<h2>Cub " +
        claimedTiger +
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
  cubInput.value = "";
};
