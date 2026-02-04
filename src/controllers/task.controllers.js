import { Task } from "../models/task.models";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (assignedTo) {
    const assignedToUser = await User.findById(assignedTo);
    if (!assignedToUser) {
      throw new ApiError(404, "Assigned to user not found");
    }
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    project: new mongoose.Types.ObjectId(projectId),
    status,
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findOne({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate([
    {
      path: "assignedTo",
      select: "avatar username fullname",
    },
    {
      path: "project",
      select: "name description",
    },
  ]);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElementAt: ["$assignedTo", 0],
        },
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1,
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
              _id: 1,
              title: 1,
              isCompleted: 1,
              createdBy: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        title: 1,
        description: 1,
        status: 1,
        attachments: 1,
        assignedTo: 1,
        subtasks: 1,
      },
    },
  ]);

  if (!task) {
    throw new ApiError(404, "Task not found -> Invalid task id or project id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  const { role } = req.user;
  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403,`${role} is not allowed to update task`);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (assignedTo) {
    const assignedToUser = await User.findById(assignedTo);
    if (!assignedToUser) {
      throw new ApiError(404, "Assigned to user not found");
    }
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(403, "Invalid task id");
  }
  const updatedAttachments = [...(task.attachments || []), ...attachments];

  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(assignedTo && { assignedTo: new mongoose.Types.ObjectId(assignedTo) }),
    ...(status && { status }),
    ...(attachments.length && { attachments: updatedAttachments }),
  };

  const tasks = await Task.findOneAndUpdate(
    {
      _id: taskId,
      project: new mongoose.Types.ObjectId(projectId),
    },
    updateData,
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { role } = req.user;

  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, `${role} is not allowed to delete task`);
  }

  const task = await Task.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId),
  });

  if (!task) {
    throw new ApiError(403, "Either project id or task id is invalid");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task is deleted successfully"));
});



export { createTask, getTask, getTaskById, updateTask, deleteTask };
