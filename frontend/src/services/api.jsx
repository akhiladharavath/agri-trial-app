import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

export const getSummary = async () => {
    const response = await API.get("/summary");
    return response.data;
};

export const getTrials = async (filters = {}) => {
    const response = await API.get("/trials", {
        params: filters
    });

    return response.data;
};

export const getTrialById = async (trialId) => {
    const response = await API.get(`/trials/${trialId}`);
    return response.data;
};

export const askAgriculturalAgent = async (question) => {
    const response = await API.post("/agent", { question });
    return response.data;
};
export const compareTrials = async (trialIds) => {
    const response = await API.post("/trials/compare", {
        trialIds
    });

    return response.data;
};

export const exportTrialsCSV = async (filters = {}) => {
    const response = await API.get("/trials/export/csv", {
        params: filters,
        responseType: "blob"
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = "agricultural-trials.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};

export default API;