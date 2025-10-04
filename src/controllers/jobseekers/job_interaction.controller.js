const {
    nanoid
} = require("nanoid");
const {
    jobInteractionModel
} = require("../../models/jobseekers/job_interaction.model");

// Create Job Interaction
exports.createJobInteraction = async (req, res) => {
    const {
        jobUID,
        seekerUID,
        action,
        feedback,
        score,
        boostWeight
    } = req.body;

    console.log(req.body, 'jobitneraction');

    try {
        const jobInteractionID = `ji_${nanoid(10)}`;

        const interaction = await jobInteractionModel.create({
            jobInteractionID,
            seekerUID,
            jobUID,
            action,
            feedback,
            score,
            boostWeight
        });

        res.status(201).json({
            success: true,
            message: "Job interaction created successfully",
            payload: interaction,
        });
    } catch (err) {
        console.error("❌ Error creating job interaction:", err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

// Get Job Interactions by seekerUID
exports.getJobInteractions = async (req, res) => {
  const { seekerUID, action } = req.query;

  try {
    const interactions = await jobInteractionModel.aggregate([
      {
        $match: { seekerUID, action }
      },
      {
        $lookup: {
          from: "job_listings",
          localField: "jobUID",
          foreignField: "jobUID",
          as: "jobDetails"
        }
      },
      { $unwind: "$jobDetails" },

      // 🔹 Join with employers (only internal jobs will match)
      {
        $lookup: {
          from: "employers",
          localField: "jobDetails.employerUID",
          foreignField: "employerUID",
          as: "employerData"
        }
      },
      {
        $unwind: {
          path: "$employerData",
          preserveNullAndEmptyArrays: true
        }
      },

      // 🔹 Join with applications (check if seeker applied)
      {
        $lookup: {
          from: "applications",
          let: { jobUID: "$jobUID", seeker: "$seekerUID" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$jobUID", "$$jobUID"] },
                    { $eq: ["$seekerUID", "$$seeker"] }
                  ]
                }
              }
            }
          ],
          as: "applications"
        }
      },

      // 🔹 Build unified company object
      {
        $set: {
          "jobDetails.company": {
            uid: {
              $cond: [
                { $eq: ["$jobDetails.isExternal", true] },
                null,
                "$employerData.employerUID"
              ]
            },
            name: {
              $cond: [
                { $eq: ["$jobDetails.isExternal", true] },
                "$jobDetails.companyName",
                "$employerData.companyName"
              ]
            },
            profilePic: {
              $cond: [
                { $eq: ["$jobDetails.isExternal", true] },
                "$jobDetails.profilePic",
                "$employerData.profilePic"
              ]
            }
          }
        }
      },

      { $sort: { createdAt: -1 } },

      {
        $project: {
          jobInteractionID: 1,
          seekerUID: 1,
          jobUID: 1,
          action: 1,
          score: 1,
          boostWeight: 1,
          feedback: 1,
          createdAt: 1,
          application: { $arrayElemAt: ["$applications", 0] },

          // keep job details + unified company
          "jobDetails._id": 1,
          "jobDetails.jobTitle": 1,
          "jobDetails.jobIndustry": 1,
          "jobDetails.jobDescription": 1,
          "jobDetails.jobSkills": 1,
          "jobDetails.location": 1,
          "jobDetails.employment": 1,
          "jobDetails.workTypes": 1,
          "jobDetails.salaryRange": 1,
          "jobDetails.status": 1,
          "jobDetails.createdAt": 1,
          "jobDetails.isExternal": 1,
          "jobDetails.company": 1
        }
      }
    ]);

    if (!interactions || interactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No job interactions found for seekerUID: ${seekerUID}`,
      });
    }

    res.json({
      success: true,
      count: interactions.length,
      payload: interactions,
    });
  } catch (err) {
    console.error("❌ Error fetching job interactions:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
