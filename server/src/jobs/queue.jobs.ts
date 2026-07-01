
import { Queue } from "bullmq";

export const redisQueue = new Queue( "TaskQueue" )