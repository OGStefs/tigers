import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const wallet = "0xe7D7C015aF94b282859184CABed04fF23a24bB1B";

const getPasses = async () => {
  const tokensOwned = [];
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-API-Key": process.env.MORALIS,
    },
  };

  //   for (let i = 0; i < keys.length; i++) {
  try {
    const response = await axios(
      `https://deep-index.moralis.io/api/v2/${wallet}/nft?chain=eth&format=decimal&token_addresses%5B0%5D=0xd124d5200c95648c9d1eb958a51e610b2a395351&media_items=false`,
      options
    ).catch(async (err) => {
      //   await sendEmail(
      //     "key moralis error",
      //     `${err.response.status}, ${err.response.data}`
      //   );
      console.error(
        "error from axios in getKeyOwnersExternal moralis call",
        err.response.status,
        err.response.data
      );
    });

    console.log(response.data.result.length);
    response?.data?.result.forEach((token) => {
      tokensOwned.push(token.token_id);
    });

    console.log(tokensOwned.sort((a, b) => a - b));
  } catch (error) {
    console.error("error from try/catc in getKeyOwnersExternal", error.message);
  }
};

await getPasses();
