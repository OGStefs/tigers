import Web3 from "web3";
console.log("da shit");

// const blockNumber = await web3.eth.getBlockNumber();
// console.log(blockNumber);

// import axios from "axios";
// import { safeToFile } from "./safeToFile.js";

// const list = {};
// let page = 0;
// let works = true;
// const pageSize = 1;

// const collection = "adventure-pass";

// const options = {
//   method: "GET",
//   headers: {
//     Accept: "application/json",
//     "X-API-KEY": "xxx",
//     "Content-Type": "application/json",
//   },
// };

// while (works) {
//   const test = await axios(
//     `https://api.opensea.io/assets?&collection=${collection}&limit=${pageSize}&offset=${
//       page * pageSize
//     }&order_direction=desc`,
//     //   }`
//     options
//   )
//     .then((response) => response.data.assets)
//     .then((response) => {
//       response.forEach((token) => {
//         if (token.image_thumbnail_url) {
//           console.log(token);
//           // console.log({ [token.token_id]: token.image_thumbnail_url });

//           // this is for enhancements, etc:

//           list[token.token_id] = {
//             url: token.image_thumbnail_url.replace("w=500", "w=250"),
//             name: token.name,
//             traits: token.traits,
//           };

//           // this is for keys, etc:
//           //   list[token.token_id] = token.image_thumbnail_url.replace(
//           //     "w=500",
//           //     "w=250"
//           //   );
//         } else {
//           list[token.token_id] =
//             "https://i.seadn.io/gae/3OBSSCXVR9RjSp7j4cuMDzfJzPP7iM617ZmAF1u8FVsGQZ3GSenOIW91hPaNN9BvULez5AhGXy9YUdQhHrZpeXAcOdb6S20V4uTYMtI?auto=format&w=128";
//         }
//       });
//     })
//     .catch((error) => {
//       console.log("error here");
//       console.log(error.message);
//       works = false;
//     });
//   //   console.log(test);
//   works = false;
//   //   page++;
// }

// console.log(list, Object.keys(list).length);

// await safeToFile(list, collection);

// // test.forEach((token) => {
// //   //   console.log(token);
// //   const id = token.token_id;
// //   console.log({ [id]: token.image_thumbnail_url });
// // });
