import axios from "axios";
import dotenv from "dotenv";
import { safeToFile } from "./safeToFile.js";

dotenv.config();

const list = {};
let cursor = "";
let works = true;
const limit = `&limit=${100}`;
const url = "https://deep-index.moralis.io/api/v2/nft/";
const contract = "0xd124d5200c95648c9d1eb958a51e610b2a395351";
const appendix = `/owners?chain=eth&format=decimal${limit}&media_items=false&cursor=`;

const options = {
  method: "GET",
  headers: {
    Accept: "application/json",
    "X-API-Key": process.env.MORALIS,
  },
};

while (works) {
  const test = await axios(url + contract + appendix + cursor, options).catch(
    (error) => {
      console.log("error here");
      console.log(error.message);
      works = false;
    }
  );

  // break loop when status is not ok
  if (!test?.statusText === "OK") works = false;

  //   console.log("Status", test?.statusText);
  //   console.log(test?.data.page);
  //   console.log(test.data.cursor);

  test?.data?.result?.forEach((res) => {
    if (list.hasOwnProperty(res.owner_of)) {
      list[res.owner_of].push(parseInt(res.token_id));
    } else {
      list[res.owner_of] = [parseInt(res.token_id)];
    }
  });
  if (test?.data?.cursor) {
    cursor = test.data.cursor;
  } else works = false;
}

// sort items in owner array
for (const [key, value] of Object.entries(list)) {
  list.key = value.sort((a, b) => a - b);
}
console.log(list);

await safeToFile(list, "vpass_owners");
