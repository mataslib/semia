import * as yup from "yup";
export const userRegisterReqSchema = yup.object().shape({
    email: yup.string()
        .required()
        .email(),
    password: yup.string()
        .required()
        .min(6),
});
export const userAuthReqSchema = yup.object().shape({
    email: yup.string()
        .required()
        .email(),
    password: yup.string()
        .required(),
});
export const joinRoomMeetingReqSchema = yup.object().shape({});
export const leaveRoomMeetingReqSchema = yup.object().shape({});
export const roomInviteMemberReqSchema = yup.object().shape({
    email: yup.string().email().required()
});
export const roomCreateReqSchema = yup.object().shape({
    name: yup.string()
        .required(),
});
export const roomListReqSchema = yup.object().shape({});
export const roomCreateMessageReqSchema = yup.object().shape({
    message: yup.string().required(),
    file: yup.object({
        data: yup.mixed().test({
            test: (value) => value instanceof Buffer
        }),
        extension: yup.string().required(),
        name: yup.string().required(),
    }).notRequired().default(undefined)
});
