import { z } from "zod";

export const skills = {
    get_current_time: {
        description: "Get the current time",
        parameters: z.object({}),
        execute: async (): Promise<string> => {
            return new Date().toLocaleTimeString();
        },
    },
    // Add more skills here
};
