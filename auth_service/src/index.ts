import { update, query, Principal, text, StableBTreeMap, Record, Opt, nat64, match, Result } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define the data structure
type User = Record<{
    id: string;
    firstname: string;
    lastname: string;
    role: string;
    username: string;
    password: string;
    email: string;
}>

type UserPayload = {
    firstname: string;
    lastname: string;
    role: string;
    username: string;
    password: string;
    email: string;
};

// Create StableBTreeMap for user data
const users = new StableBTreeMap<string, User>(0, 44, 1024);

query;
// Find all users info
export function getUsers(): Result<Vec<User>, string> {
    return Result.Ok(users.values());
}

query;
// Find user info by user ID
export function getUser(id: string): Result<User, string> {
    return match(users.get(id), {
        Some: (user) => Result.Ok<User, string>(user),
        None: () => Result.Err<User, string>(`user with id=${id} not found`)
    });
}

update;
// Create new user
export function createUser(payload: UserPayload): Result<User, string> {
    const user: User = {
        id: uuidv4(),
        ...payload,
    };

    // Check if user with the same username already exists
    const existingUser = users.values().find(u => u.username === user.username);
    if (existingUser) {
        return Result.Err<User, string>(`user with username ${user.username} already exists`);
    }

    users.insert(user.id, user); // store new user
    return Result.Ok(user);
}

update;
// Update user info by user id
export function updateUser(id: string, payload: UserPayload): Result<User, string> {
    return match(users.get(id), {
        Some: (user: User) => {
            const updatedUser: User = {
                ...user,
                ...payload,
            };
            users.insert(user.id, updatedUser);
            return Result.Ok<User, string>(updatedUser);
        },
        None: () => Result.Err<User, string>(`User with id=${id} not found`)
    });
}

update;
// Delete user
export function deleteUser(id: string): Result<string, string> {
    return match(users.get(id), {
        Some: (user: User) => {
            users.remove(id); // remove user from user storage
            return Result.Ok<string, string>(`User deleted successfully`);
        },
        None: () => {
            return Result.Err<string, string>(`User with id=${id} not found`);
        },
    });
}
