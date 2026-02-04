import { Task } from "../models/task.models";
import { Project } from "../models/project.models.js";
import { Subtask } from "../models/subTask.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const createSubTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, isCompleted } = req.body;

  const { role } = req.user;
  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, `${role} is not allowed to create sub-task`);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Invalid Project Id");
  }

  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId),
  });
  if (!task) {
    throw new ApiError(404, "Invalid Task Id");
  }

  const subTaskData = {
    title,
    task: new mongoose.Types.ObjectId(taskId),
    isCompleted,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  };
  const subTask = await Subtask.create(subTaskData);

  return res
    .status(201)
    .json(new ApiResponse(201, subTask, "Sub task created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;
  const { isCompleted } = req.body;

  const { role } = req.user;
  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, `${role} is not allowed to create sub-task`);
  }

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Sub task not found");
  }

  const task = await Task.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    _id: new mongoose.Types.ObjectId(subtask.task),
  });
  if (!task) {
    throw new ApiError(404, "Task related to sub task not found");
  }

  subtask.isCompleted = isCompleted;
  const updateSubtask = await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updateSubtask, "sub task updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  const { role } = req.user;
  if (role != UserRolesEnum.ADMIN && role != UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, `${role} is not allowed to delete sub-task`);
  }

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Sub task not found");
  }

  const task = await Task.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    _id: new mongoose.Types.ObjectId(subtask.task),
  });
  if (!task) {
    throw new ApiError(404, "Task related to sub task not found");
  }

  await Subtask.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(subTaskId),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Sub task removed successfully"));
});

export { createSubTask, updateSubTask, deleteSubTask };
