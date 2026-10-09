const Trial = require("../models/Trial");


const getTrials = async (req, res) => {
try {
const {
crop,
product,
country,
year,
trialType
} = req.query;


   
    const page = Math.max(
        1,
        Number.parseInt(req.query.page, 10) || 1
    );

    const requestedLimit = Number.parseInt(
        req.query.limit,
        10
    ) || 10;

    const limit = Math.min(
        100,
        Math.max(1, requestedLimit)
    );

    const skip = (page - 1) * limit;

    // Build filters
    const filter = {};

    if (crop) {
        filter.crop = {
            $regex: crop,
            $options: "i"
        };
    }

    if (product) {
        filter.product = {
            $regex: product,
            $options: "i"
        };
    }

    if (country) {
        filter.country = {
            $regex: country,
            $options: "i"
        };
    }

    if (year) {
        const parsedYear = Number(year);

        if (!Number.isInteger(parsedYear)) {
            return res.status(400).json({
                message: "Year must be a valid integer."
            });
        }

        filter.year = parsedYear;
    }

    if (trialType) {
        filter.trialType = {
            $regex: trialType,
            $options: "i"
        };
    }

  
    const [trials, totalRecords] = await Promise.all([
        Trial.find(filter)
            .sort({ trialId: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Trial.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        count: totalRecords,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        filters: {
            crop: crop || null,
            product: product || null,
            country: country || null,
            year: year || null,
            trialType: trialType || null
        },
        trials
    });
} catch (error) {
    console.error("Error fetching trials:", error);

    res.status(500).json({
        message: "Failed to fetch trials",
        error: error.message
    });
}


};



const exportTrialsCSV = async (req, res) => {
    try {
        const { crop, product, country, year, trialType } = req.query;

        const filter = {};

        if (crop) filter.crop = { $regex: crop, $options: "i" };
        if (product) filter.product = { $regex: product, $options: "i" };
        if (country) filter.country = { $regex: country, $options: "i" };
        if (trialType) {
            filter.trialType = { $regex: trialType, $options: "i" };
        }

        if (year) {
            const parsedYear = Number(year);

            if (!Number.isInteger(parsedYear)) {
                return res.status(400).json({
                    message: "Year must be a valid integer."
                });
            }

            filter.year = parsedYear;
        }

        const trials = await Trial.find(filter)
            .sort({ trialId: 1 })
            .lean();

        const columns = [
            "trialId",
            "crop",
            "product",
            "country",
            "year",
            "trialType",
            "treatmentYield",
            "controlYield",
            "yieldUnit"
        ];

        const escapeCSV = (value) => {
            let text = value == null ? "" : String(value);

            if (/^[\s]*[=+\-@]/.test(text)) {
                text = "'" + text;
            }

            return `"${text.replace(/"/g, '""')}"`;
        };

        const rows = [
            columns.join(","),
            ...trials.map((trial) =>
                columns.map((column) => escapeCSV(trial[column])).join(",")
            )
        ];

        const csv = "\uFEFF" + rows.join("\r\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="agricultural-trials.csv"'
        );

        return res.status(200).send(csv);
    } catch (error) {
        console.error("CSV export failed:", error);

        return res.status(500).json({
            message: "Failed to export trials."
        });
    }
};


// GET one trial by ID
const getTrialById = async (req, res) => {
try {
const trial = await Trial.findOne({
trialId: req.params.trialId
});


    if (!trial) {
        return res.status(404).json({
            message: "Trial not found"
        });
    }

    res.status(200).json(trial);
} catch (error) {
    console.error("Error fetching trial:", error);

    res.status(500).json({
        message: "Failed to fetch trial",
        error: error.message
    });
}

};

const compareTrials = async (req, res) => {
    try {
        let { trialIds } = req.body;

        if (!Array.isArray(trialIds) || trialIds.length < 2) {
            return res.status(400).json({
                message: "Select at least 2 trials to compare."
            });
        }

        if (trialIds.length > 10) {
            return res.status(400).json({
                message: "You can compare a maximum of 10 trials."
            });
        }

        // Remove duplicate IDs
        trialIds = [...new Set(
            trialIds
                .filter((id) => typeof id === "string")
                .map((id) => id.trim())
                .filter(Boolean)
        )];

        if (trialIds.length < 2) {
            return res.status(400).json({
                message: "Select at least 2 valid trial IDs."
            });
        }

        const trials = await Trial.find({
            trialId: { $in: trialIds }
        })
            .sort({ trialId: 1 })
            .lean();

        if (trials.length < 2) {
            return res.status(404).json({
                message: "At least 2 matching trials are required."
            });
        }

        const results = trials.map((trial) => {
            const treatment = Number(trial.treatmentYield);
            const control = Number(trial.controlYield);

            const validYields =
                trial.treatmentYield !== null &&
                trial.treatmentYield !== undefined &&
                trial.treatmentYield !== "" &&
                trial.controlYield !== null &&
                trial.controlYield !== undefined &&
                trial.controlYield !== "" &&
                Number.isFinite(treatment) &&
                Number.isFinite(control);

            const improvement =
                validYields && control !== 0
                    ? ((treatment - control) / Math.abs(control)) * 100
                    : null;

            return {
                ...trial,
                yieldDifference:
                    validYields ? treatment - control : null,
                improvementPercent:
                    improvement === null
                        ? null
                        : Number(improvement.toFixed(2)),
                comparisonNote: !validYields
                    ? "Yield data missing or invalid"
                    : control === 0
                        ? "Cannot calculate percentage: control yield is zero"
                        : null
            };
        });

        return res.status(200).json({
            count: results.length,
            trials: results
        });
    } catch (error) {
        console.error("Trial comparison failed:", error);

        return res.status(500).json({
            message: "Failed to compare trials."
        });
    }
};


module.exports = {
getTrials,
getTrialById,
exportTrialsCSV,
compareTrials
};
