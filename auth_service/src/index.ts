import {
    query,
    update,
    Canister,
    text,
    Record,
    StableBTreeMap,
    Ok,
    None,
    Some,
    Err,
    Vec,
    Result,
    nat64,
    ic,
    Opt,
    Variant,
} from 'azle';

import { v4 as uuidv4 } from 'uuid';

const loginData = Record({
    id: text,
    name: text,
    password: text
})

const RegisterPayload = Record({
    email: text,
    password: text,
});

const LoginPayload = Record({
    email: text,
    password: text,
});

const ProfilePayload = Record({
    id: text,
    username: text,
    description: text,
    gender: text,
    location: text,
    address: text
})

const Register = Record ({
    id: text,
    email: text,
    password: text,
    createdAt: nat64,
    updatedAt: Opt(nat64),
})

const Error = Variant({
    NotFound: text,
    InvalidPayload: text,
});

const userStorage = StableBTreeMap(text, Register, 0);

export default Canister({

    //user register
    userSignUp: update([RegisterPayload], Result(Register, Error), (payload) => {
        const user = { id: uuidv4(), createdAt: ic.time(), updatedAt: None, ...payload };
        userStorage.insert(user.id, user);
        return Ok(user);
    }),

    //user login
    logIn: update([LoginPayload], Result(Register, Error), (payload) => {
        const { email } = payload;
        const userFound = userStorage.values().some((user: typeof Register) => user.email === email);
        if (userFound) {
            return Ok({ id: uuidv4(), email, password: '********', createdAt: ic.time(), updatedAt: None });
        } else {
            return Err({
                NotFound: `login Failed=${email}. Error 404 user not found.`,
            });
        }
    }),

    //code to view all users
    viewAllUsers: query([], Vec(Register), () => {
        return userStorage.values();
    }),

    //code to view a single user
    viewUser: query([text], Opt(Register), (id) => {
        return userStorage.get(id);
    }),

    //code to delete a usser
      deleteUser: update([text], Result(Register, Error), (id) => {
        const deletedUser = userStorage.remove(id);
        if ('None' in deletedUser) {
            return Err({ NotFound: `Couldn't delete the user with id=${id}. Error 404 user not fond.` });
        }
        return Ok(deletedUser.Some);
    }),

    //create a profile using ProfilePayload
    createProfile: update([ProfilePayload], Result(ProfilePayload, Error), (payload) => {
        const { id: profileId, ...restPayload } = payload;
        const profile = { id: profileId || uuidv4(), ...restPayload };
        userStorage.insert(profile.id, profile);
        return Ok(profile);
    }),

    //update a profile
    updateProfile: update([ProfilePayload], Result(ProfilePayload, Error), (payload) => {
        const { id: profileId, ...restPayload } = payload;
        const profile = { id: profileId || uuidv4(), ...restPayload };
        userStorage.insert(profile.id, profile);
        return Ok(profile);
    }),

    //delete a profile 
    deleteProfile: update([text], Result(ProfilePayload, Error), (id) => {
        const deletedProfile = userStorage.remove(id);
        if ('None' in deletedProfile) {
            return Err({ NotFound: `Couldn't delete the profile with id=${id}. Error 404 profile not fond.` });
        }
        return Ok(deletedProfile.Some);
    }),

   
});

