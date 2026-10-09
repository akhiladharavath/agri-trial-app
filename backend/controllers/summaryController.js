const Trial = require("../models/Trial");

const getSummary = async (req, res) => {
    try {
        const trials = await Trial.find();

        const totalTrials = trials.length;

        // Unique crops
        const crops = [
            ...new Set(
                trials
                    .map((trial) => trial.crop)
                    .filter(Boolean)
            )
        ].sort();

        // Unique products
        const products = [
            ...new Set(
                trials
                    .map((trial) => trial.product)
                    .filter(Boolean)
            )
        ].sort();

        // Unique countries
        const countries = [
            ...new Set(
                trials
                    .map((trial) => trial.country)
                    .filter(Boolean)
            )
        ].sort();

        // Unique years
        const years = [
            ...new Set(
                trials
                    .map((trial) => trial.year)
                    .filter(Boolean)
            )
        ].sort((a, b) => b - a);

        // Unique trial types
        const trialTypes = [
            ...new Set(
                trials
                    .map((trial) => trial.trialType)
                    .filter(Boolean)
            )
        ].sort();

        // Yield calculations
        let totalTreatmentYield = 0;
        let totalControlYield = 0;
        let yieldCount = 0;

        trials.forEach((trial) => {
            trial.results.forEach((result) => {

                if (
                    result.normalizedTreatmentYield !== null &&
                    result.normalizedTreatmentYield !== undefined &&
                    result.normalizedControlYield !== null &&
                    result.normalizedControlYield !== undefined
                ) {
                    totalTreatmentYield +=
                        result.normalizedTreatmentYield;

                    totalControlYield +=
                        result.normalizedControlYield;

                    yieldCount++;
                }
            });
        });

        const averageTreatmentYield =
            yieldCount > 0
                ? totalTreatmentYield / yieldCount
                : 0;

        const averageControlYield =
            yieldCount > 0
                ? totalControlYield / yieldCount
                : 0;

        const improvementPercent =
            averageControlYield > 0
                ? (
                      (
                          averageTreatmentYield -
                          averageControlYield
                      ) /
                      averageControlYield
                  ) * 100
                : 0;

        res.status(200).json({

            // Summary
            totalTrials,

            totalCrops: crops.length,

            totalProducts: products.length,

            totalCountries: countries.length,

            // Filter options
            crops,

            products,

            countries,

            years,

            trialTypes,

            // Yield statistics
            averageTreatmentYield:
                Number(
                    averageTreatmentYield.toFixed(2)
                ),

            averageControlYield:
                Number(
                    averageControlYield.toFixed(2)
                ),

            averageImprovementPercent:
                Number(
                    improvementPercent.toFixed(2)
                )
        });

    } catch (error) {

        console.error(
            "Error generating summary:",
            error
        );

        res.status(500).json({
            message: "Failed to generate summary",
            error: error.message
        });
    }
};

module.exports = {
    getSummary
};