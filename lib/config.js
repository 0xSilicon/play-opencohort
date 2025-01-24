require("dotenv").config();

exports.SILICON_RPC = process.env.SILICON_RPC
    ? process.env.SILICON_RPC
    : "https://rpc.silicon.network";

exports.OPEN_COHORT_ENDPOINT = process.env.OPEN_COHORT_ENDPOINT
    ? process.env.OPEN_COHORT_ENDPOINT
    : "https://api-cohort.silicon.network";
