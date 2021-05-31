/// <reference types="node" />
import * as yup from "yup";
import mongodb from 'mongodb';
export interface SuccessResponse {
    result: any;
}
export interface ErrorResponse {
    error: {
        message: string;
    };
}
export interface UserRegisterMessage {
    email: string;
    password: string;
}
export interface UserRegisterSuccessResponse extends SuccessResponse {
    result: true;
}
export declare type UserRegisterResponse = UserRegisterSuccessResponse | ErrorResponse;
export declare const userRegisterReqSchema: yup.ObjectSchema<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    password: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>, Record<string, any>, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    password: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    password: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>>;
export interface AuthSuccessResponse extends SuccessResponse {
    result: {
        token: string;
    };
}
export declare type AuthResponse = AuthSuccessResponse | ErrorResponse;
export interface AuthMessage {
    email: string;
    password: string;
}
export declare const userAuthReqSchema: yup.ObjectSchema<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    password: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>, Record<string, any>, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    password: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    password: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>>;
export interface RoomJoinMeetingMessage {
}
export interface RoomJoinSuccessResponse extends SuccessResponse {
    result: true;
}
export declare type RoomJoinMeetingResponse = RoomJoinSuccessResponse | ErrorResponse;
export declare const joinRoomMeetingReqSchema: yup.ObjectSchema<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}, Record<string, any>, import("yup/lib/object").TypeOfShape<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}>, import("yup/lib/object").AssertsShape<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}>>;
export interface RoomLeaveMeetingMessage {
}
export interface RoomLeaveSuccessResponse extends SuccessResponse {
    result: true;
}
export declare type RoomLeaveMeetingResponse = RoomLeaveSuccessResponse | ErrorResponse;
export declare const leaveRoomMeetingReqSchema: yup.ObjectSchema<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}, Record<string, any>, import("yup/lib/object").TypeOfShape<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}>, import("yup/lib/object").AssertsShape<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}>>;
export interface RoomListMembersSuccessResponse {
    result: User[];
}
export declare type RoomListMembersResponse = RoomListMembersSuccessResponse | ErrorResponse;
export interface RoomInviteMemberReq {
    email: string;
}
export interface RoomInviteMemberSuccessResult {
    result: true;
}
export declare type RoomInviteMemberResult = RoomInviteMemberSuccessResult | ErrorResponse;
export declare const roomInviteMemberReqSchema: yup.ObjectSchema<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>, Record<string, any>, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    email: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>>;
export interface RoomNewMemberMessage {
    user: RoomUser;
}
export interface RoomCreateReq {
    name: string;
}
export interface RoomCreateSuccessResponse extends SuccessResponse {
    result: true;
}
export declare type RoomCreateResponse = RoomCreateSuccessResponse | ErrorResponse;
export declare const roomCreateReqSchema: yup.ObjectSchema<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>, Record<string, any>, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
}>>>;
export interface NewRoomMessage {
    room: Room;
}
export interface RoomListReq {
}
export interface RoomListSuccessResponse extends SuccessResponse {
    result: RoomUser[];
}
export declare type RoomListResponse = RoomListSuccessResponse | ErrorResponse;
export declare const roomListReqSchema: yup.ObjectSchema<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}, Record<string, any>, import("yup/lib/object").TypeOfShape<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}>, import("yup/lib/object").AssertsShape<{
    [x: string]: yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>;
}>>;
export interface RoomMessagesSuccessResponse extends SuccessResponse {
    result: Message[];
}
export declare type RoomMessagesResponse = RoomMessagesSuccessResponse | ErrorResponse;
export interface RoomCreateMessageReq {
    message: string;
    file?: {
        data: Buffer;
        extension: string;
        name: string;
    };
}
export interface RoomCreateMessageSuccess extends SuccessResponse {
    result: true;
}
export declare type RoomCreateMessageRes = RoomCreateMessageSuccess | ErrorResponse;
export declare const roomCreateMessageReqSchema: yup.ObjectSchema<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    message: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    file: yup.ObjectSchema<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }, Record<string, any>, import("yup/lib/object").TypeOfShape<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }> | undefined, import("yup/lib/object").AssertsShape<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }> | undefined>;
}>, Record<string, any>, import("yup/lib/object").TypeOfShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    message: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    file: yup.ObjectSchema<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }, Record<string, any>, import("yup/lib/object").TypeOfShape<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }> | undefined, import("yup/lib/object").AssertsShape<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }> | undefined>;
}>>, import("yup/lib/object").AssertsShape<import("yup/lib/object").Assign<Record<string, yup.AnySchema<any, any, any> | import("yup/lib/Reference").default<unknown> | import("yup/lib/Lazy").default<any, any>>, {
    message: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    file: yup.ObjectSchema<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }, Record<string, any>, import("yup/lib/object").TypeOfShape<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }> | undefined, import("yup/lib/object").AssertsShape<{
        data: import("yup/lib/mixed").MixedSchema<any, Record<string, any>, any>;
        extension: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
        name: import("yup/lib/string").RequiredStringSchema<string | undefined, Record<string, any>>;
    }> | undefined>;
}>>>;
export interface NewMessageMessage {
    message: Message;
}
export interface User {
    _id?: mongodb.ObjectID;
    email: string;
    password: string;
    tokens: Token[];
}
export interface Token {
    token: mongodb.ObjectID;
}
export interface Message {
    _id?: mongodb.ObjectID;
    createdAt: Date;
    message: string;
    userName: string;
    userRef: mongodb.ObjectID;
    file?: {
        path: string;
    };
}
export interface Room {
    _id?: mongodb.ObjectID;
    name: string;
    users: RoomUser[];
    messages: Message[];
}
export declare type RoomUserRole = 'author' | 'user';
export interface RoomUser {
    userId: mongodb.ObjectID;
    name: string;
    role: RoomUserRole;
}
export interface WrtcSendOfferMessage {
    to: string;
    connectionId: string;
}
