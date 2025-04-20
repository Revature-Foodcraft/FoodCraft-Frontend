import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../pages/Login';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../Components/Contexts';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedUsedNavigate,
    };
});

jest.mock('@react-oauth/google', () => ({
    GoogleLogin: ({ onSuccess, onError }: { onSuccess: Function; onError: Function }) => (
        <button
            data-testid="google-login"
            onClick={() => onSuccess({ credential: 'dummy-google-credential' })}
        >
            Google Login
        </button>
    ),
}));

describe('Login Component', () => {
    const setLogInStatusMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });
    test('renders the login form elements', () => {
        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
    });

    test('successful form login', async () => {
        const dummyToken = 'dummy-token';

        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ token: dummyToken }),
        } as unknown as Response);

        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://3.144.40.72:5000/login', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'testuser', password: 'password123' }),
            }));
        });

        expect(localStorage.getItem('token')).toBe(dummyToken);
        expect(setLogInStatusMock).toHaveBeenCalledWith(true);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
    });

    test('displays an error message on failed login', async () => {
        const errorMessage = 'Invalid credentials';


        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: errorMessage }),
        } as unknown as Response);

        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), {
            target: { value: 'wronguser' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'wrongpassword' },
        });

        fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

        const errorElement = await screen.findByText(errorMessage);
        expect(errorElement).toBeInTheDocument();

        expect(setLogInStatusMock).not.toHaveBeenCalled();
        expect(mockedUsedNavigate).not.toHaveBeenCalled();
    });

    test('successful Google login', async () => {
        const dummyToken = 'dummy-google-token';

        jest.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ token: dummyToken }),
        } as unknown as Response);

        render(
            <AuthContext.Provider value={{ isLoggedIn: false, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        const googleButton = screen.getByTestId('google-login');
        fireEvent.click(googleButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://3.144.40.72:5000/auth/google', expect.objectContaining({
                method: 'POST',
                headers: { "Authorization": `Bearer dummy-google-credential` },
            }));
        });

        expect(localStorage.getItem('token')).toBe(dummyToken);
        expect(setLogInStatusMock).toHaveBeenCalledWith(true);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
    });
});