import mongoose, { model, Model, Schema } from "mongoose";

export const SETTINGS_LIMITS = {
    businessName: 120,
    supportEmail: 254,
    knowledge: 20000,
} as const;

export interface ISettings {
    ownerId: string;
    businessName: string;
    supportEmail: string;
    knowledge: string;
}

const settingsSchema = new Schema<ISettings>(
    {
        ownerId: { type: String, required: true, unique: true },
        businessName: { type: String, trim: true, maxlength: SETTINGS_LIMITS.businessName, default: "" },
        supportEmail: { type: String, trim: true, maxlength: SETTINGS_LIMITS.supportEmail, default: "" },
        knowledge: { type: String, trim: true, maxlength: SETTINGS_LIMITS.knowledge, default: "" },
    },
    { timestamps: true },
);

const Settings: Model<ISettings> =
    (mongoose.models.Settings as Model<ISettings>) || model<ISettings>("Settings", settingsSchema);
export default Settings;
