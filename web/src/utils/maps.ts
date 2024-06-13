// const csv = require("csvtojson");
// const fs = require("fs");
// const path = require("path");

// const inputFilePath = "data.csv";
// const outputDir = "chunks";
// const chunkSize = 10000; // Adjust based on performance needs

// // what does htis code do?
// // put into chatGPT to figure itout

// // Ensure the output directory exists
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }

// csv()
//   .fromFile(inputFilePath)
//   .then((jsonObj) => {
//     let chunkCounter = 0;
//     for (let i = 0; i < jsonObj.length; i += chunkSize) {
//       const chunk = jsonObj.slice(i, i + chunkSize);
//       const geoJsonChunk = {
//         type: "FeatureCollection",
//         features: chunk.map((row) => ({
//           type: "Feature",
//           properties: row,
//           geometry: {
//             type: "Point",
//             coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
//           },
//         })),
//       };
//       fs.writeFileSync(
//         path.join(outputDir, `chunk_${chunkCounter}.geojson`),
//         JSON.stringify(geoJsonChunk)
//       );
//       chunkCounter++;
//     }
//     console.log(`Created ${chunkCounter} chunks`);
//   });
