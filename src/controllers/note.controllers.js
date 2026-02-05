import { Project } from "../models/project.models.js";
import { ProjectNote } from "../models/note.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { UserRolesEnum } from "../utils/constants.js";
import mongoose from "mongoose";

const createProjectNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;
  const { role } = req.user;

  if (role != UserRolesEnum.ADMIN) {
    throw new ApiError(403, `${role} is not allowed to create project note`);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectNoteData = {
    content,
    project: new mongoose.Types.ObjectId(projectId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  };
  const note = await ProjectNote.create(projectNoteData);
  return res
    .status(201)
    .json(new ApiResponse(201, note, "Project note created successfully"));
});

const listProjectNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const note = await ProjectNote.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate([
    {
      path: "project",
      select: "name description",
    },
    {
      path: "createdBy",
      select: "avatar username fullname",
    },
  ]);

  if (!note.length) {
    throw new ApiError(404, "Project Notes not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Project Notes fetched successfully"));
});

const getProjectNoteDetails = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;
  const noteDetails = await ProjectNote.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(noteId),
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projectDetail",
        pipeline: [
          {
            $project: {
              _id: 0,
              name: 1,
              description: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        projectDetail: {
          $arrayElementAt: ["$projectDetail", 0],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              _id: 0,
              avatar: 1,
              username: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        createdBy: {
          $arrayElementAt: ["$createdBy", 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        content: 1,
        projectDetail: 1,
        createdBy: 1,
      },
    },
  ]);
  if (!noteDetails.length) {
    throw new ApiError(403, "Invalid projectId or noteId");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, noteDetails, "note details fetched successfully"),
    );
});

const updateProjectNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { projectId, noteId } = req.params;
  const { role } = req.user;
  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, `${role} is not allowed to update note`);
  }
  const note = await ProjectNote.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(noteId),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      content,
    },
    { new: true },
  );
  if (!note) {
    throw new ApiError(403, "Invalid project id or note id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note details updated successfully"));
});

const deleteProjectNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;
  const { role } = req.user;
  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, `${role} is not allowed to delete note`);
  }
  const note = await ProjectNote.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(noteId),
    project: new mongoose.Types.ObjectId(projectId),
  });
  if (!note) {
    throw new ApiError(403, "Invalid project id or note id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note details deleted successfully"));
});

export {
  createProjectNote,
  listProjectNote,
  getProjectNoteDetails,
  updateProjectNote,
  deleteProjectNote,
};
