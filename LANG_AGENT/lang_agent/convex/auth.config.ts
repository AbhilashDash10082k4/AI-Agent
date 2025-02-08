
export default {
    providers: [
      {
        domain: process.env.ISSUER_URL,
        applicationID: "convex",
      },
    ]
  };

//this file-> server side configuration for validating tokens,