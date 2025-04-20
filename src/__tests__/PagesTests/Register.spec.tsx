import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../pages/Register';
import { AuthContext } from '../../Components/Contexts';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../assets/FoodCraft-Logo.png', () => 'foodCraftLogo.png');
jest.mock('../assets/backroundRegister.mp4', () => 'backgroundRegister.mp4');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        ...originalModule,
        useNavigate: () => mockedNavigate,
    };
});

jest.mock('@react-oauth/google', () => ({
    GoogleLogin: (props: { onSuccess: Function; onError: Function; text?: string }) => (
        <button
            data-testid="google-login"
            onClick={() => props.onSuccess({ credential: 'dummy-google-credential' })}
        >
            GoogleLoginMock
        </button>
    ),
}));

const setLogInStatusMock = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedNavigate.mockClear();
});

describe('Register Component', () => {

    test('renders the registration form elements', () => {
        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText(/Register to FoodCraft/i)).toBeInTheDocument();

        expect(screen.getByPlaceholderText(/Choose a username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/johndoe@example\.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^John$/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^Doe$/i)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();

        expect(screen.getByTestId("google-login")).toBeInTheDocument();
    });

    test('successful registration and login flow', async () => {
        const testValues = {
            username: 'testuser',
            password: 'password123',
            email: 'test@example.com',
            firstname: 'John',
            lastname: 'Doe'
        };

        const registerResponse = {
            ok: true,
            json: () => Promise.resolve({ message: 'Registered successfully' })
        } as Response;

        const loginResponse = {
            status: 200,
            json: () => Promise.resolve({ token: 'dummy-token' })
        } as Response;

        const fetchSpy = jest.spyOn(global, 'fetch')
            .mockResolvedValueOnce(registerResponse)
            .mockResolvedValueOnce(loginResponse);

        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.change(screen.getByPlaceholderText(/Choose a username/i), {
            target: { value: testValues.username }
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
            target: { value: testValues.password }
        });
        fireEvent.change(screen.getByPlaceholderText(/johndoe@example\.com/i), {
            target: { value: testValues.email }
        });
        fireEvent.change(screen.getByPlaceholderText(/^John$/i), {
            target: { value: testValues.firstname }
        });
        fireEvent.change(screen.getByPlaceholderText(/^Doe$/i), {
            target: { value: testValues.lastname }
        });

        fireEvent.click(screen.getByRole('button', { name: /^Register$/i }));

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(2);
            expect(fetchSpy).toHaveBeenLastCalledWith(
                'http://3.144.40.72:5000/login',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: testValues.username, password: testValues.password })
                })
            );
        });

        expect(localStorage.getItem('token')).toBe('dummy-token');

        expect(setLogInStatusMock).toHaveBeenCalledWith(true);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    test('displays error message when registration fails', async () => {
        const registerErrorResponse = {
            ok: false,
            json: () => Promise.resolve({ message: 'Username already exists' })
        } as Response;

        jest.spyOn(global, 'fetch').mockResolvedValueOnce(registerErrorResponse);

        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.change(screen.getByPlaceholderText(/Choose a username/i), {
            target: { value: 'existinguser' }
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
            target: { value: 'pass' }
        });
        fireEvent.change(screen.getByPlaceholderText(/johndoe@example\.com/i), {
            target: { value: 'existing@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/^John$/i), {
            target: { value: 'John' }
        });
        fireEvent.change(screen.getByPlaceholderText(/^Doe$/i), {
            target: { value: 'Doe' }
        });

        fireEvent.click(screen.getByRole('button', { name: /^Register$/i }));

        const errorMessage = await screen.findByText(/Username already exists/i);
        expect(errorMessage).toBeInTheDocument();

        expect(localStorage.getItem('token')).toBeNull();
        expect(setLogInStatusMock).not.toHaveBeenCalled();
        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    test('successful google login flow', async () => {
        const googleLoginResponse = {
            status: 200,
            json: () => Promise.resolve({ token: 'dummy-google-token' })
        } as Response;

        const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce(googleLoginResponse);

        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByTestId("google-login"));

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                'http://3.144.40.72:5000/auth/google',
                expect.objectContaining({
                    method: 'POST',
                    headers: { "Authorization": expect.stringContaining("dummy-google-credential") }
                })
            );
        });

        expect(localStorage.getItem('token')).toBe('dummy-google-token');

        expect(setLogInStatusMock).toHaveBeenCalledWith(true);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
});