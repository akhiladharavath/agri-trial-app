
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const connectDB = require("../db");
const Trial = require("../models/Trial");

const dataFolder = path.join(__dirname, "../../data");

function normalizeCrop(crop) {
    const value = String(crop ?? "").trim().toLowerCase();

    if (value === "wheat") return "Wheat";
    if (value === "potato" || value === "potatoes") return "Potato";

    return String(crop ?? "").trim();
}

function normalizeProduct(product) {
    const value = String(product ?? "").trim().toLowerCase();

    if (["harvest plus", "harvestplus", "harvest-plus"].includes(value)) {
        return "Harvest Plus";
    }

    if (["root boost", "rootboost", "root-boost"].includes(value)) {
        return "Root Boost";
    }

    return String(product ?? "").trim();
}

function normalizeCountry(country) {
    const value = String(country ?? "").trim().toUpperCase();

    const countries = {
        FR: "France",
        DE: "Germany",
        ES: "Spain"
    };

    return countries[value] || String(country ?? "").trim();
}

function parseYield(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function convertToKg(value, unit) {
    const number = parseYield(value);

    if (number === null) return null;

    const normalizedUnit = String(unit ?? "").trim().toLowerCase();

    if (normalizedUnit === "t/ha") {
        return number * 1000;
    }

    if (normalizedUnit === "kg/ha") {
        return number;
    }

   
    return null;
}

async function readCSV(fileName) {
    return new Promise((resolve, reject) => {
        const rows = [];
        const filePath = path.join(dataFolder, fileName);

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                let normalizedRow;

                if (fileName === "trials_a.csv") {
                    normalizedRow = {
                        trial_id: row.trial_id,
                        crop: row.crop,
                        product: row.product,
                        country: row.country,
                        year: row.year,
                        trial_type: row.trial_type,
                        treatment_yield: row.treatment_yield,
                        control_yield: row.control_yield,
                        yield_unit: row.yield_unit
                    };
                } else if (fileName === "trials_b.csv") {
                    normalizedRow = {
                        trial_id: row["Trial reference"],
                        crop: row["Crop name"],
                        product: row["Product name"],
                        country: row["Country code"],
                        year: row["Season year"],
                        trial_type: row["Trial category"],
                        treatment_yield: row["Treated yield kg per ha"],
                        control_yield: row["Untreated yield kg per ha"],
                        yield_unit: "kg/ha"
                    };
                }

                if (normalizedRow) {
                    rows.push(normalizedRow);
                }
            })
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
}

async function importData() {
    try {
        await connectDB();

        const files = ["trials_a.csv", "trials_b.csv"];

        let importedCount = 0;
        let skippedCount = 0;

        for (const fileName of files) {
            const rows = await readCSV(fileName);
            console.log(`${fileName}: ${rows.length} rows`);

            for (const row of rows) {
                const trialId = String(row.trial_id ?? "").trim();
                const crop = normalizeCrop(row.crop);
                const product = normalizeProduct(row.product);
                const country = normalizeCountry(row.country);
                const year = parseYield(row.year);

                if (!trialId || !crop || !product || !country) {
                    console.warn(
                        `Skipping invalid row from ${fileName}: missing required fields`
                    );
                    skippedCount++;
                    continue;
                }

                const unit = String(row.yield_unit ?? "").trim() || null;
                const treatment = parseYield(row.treatment_yield);
                const control = parseYield(row.control_yield);

                const result = {
                    source: fileName,
                    treatmentYield: treatment,
                    controlYield: control,
                    unit,
                    normalizedUnit: "kg/ha",
                    normalizedTreatmentYield: convertToKg(
                        row.treatment_yield,
                        unit
                    ),
                    normalizedControlYield: convertToKg(
                        row.control_yield,
                        unit
                    )
                };

                const sourceDetail = {
                    fileName,
                    title: null,
                    reference: null,
                    url: null,
                    page: null
                };

                let trial = await Trial.findOne({ trialId });

                if (!trial) {
                    trial = new Trial({
                        trialId,
                        crop,
                        product,
                        country,
                        year: year === null ? undefined : year,
                        trialType: row.trial_type || undefined,
                        results: [],
                        sources: [],
                        sourceDetails: [],
                        notes: []
                    });
                } else {
                   
                    trial.crop = crop;
                    trial.product = product;
                    trial.country = country;

                    if (year !== null) {
                        trial.year = year;
                    }

                    if (row.trial_type) {
                        trial.trialType = row.trial_type;
                    }
                }

               .
                const resultIndex = trial.results.findIndex(
                    (item) => item.source === fileName
                );

                if (resultIndex >= 0) {
                    trial.results[resultIndex] = result;
                } else {
                    trial.results.push(result);
                }

                if (!trial.sources.includes(fileName)) {
                    trial.sources.push(fileName);
                }

               
                const sourceIndex = trial.sourceDetails.findIndex(
                    (item) => item.fileName === fileName
                );

                if (sourceIndex < 0) {
                    trial.sourceDetails.push(sourceDetail);
                }

                await trial.save();
                importedCount++;
            }
        }

        console.log("Import completed.");
        console.log(`Rows processed successfully: ${importedCount}`);
        console.log(`Rows skipped: ${skippedCount}`);
        console.log("Source filenames are now stored in sourceDetails.");
    } catch (error) {
        console.error("Import failed:", error);
        process.exitCode = 1;
    } finally {
        const mongoose = require("mongoose");
        await mongoose.disconnect();
    }
}

importData();