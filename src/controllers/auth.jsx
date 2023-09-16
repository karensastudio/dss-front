import { register } from "../api/auth";

export async function Register({
    first_name,
    last_name,
    email,
    password,
    project
}) {
    return await register({
        first_name,
        last_name,
        email,
        password,
        project
    });
}