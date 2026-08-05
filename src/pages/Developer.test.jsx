import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Developer from "./Developer";

const { useAuthMock, useAuthClientMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useAuthClientMock: vi.fn(),
}));

vi.mock("../contextProviders/AuthProvider", () => ({
  useAuth: useAuthMock,
}));
vi.mock("../contextProviders/AuthClientContext", () => ({
  UseAuthClient: useAuthClientMock,
}));
vi.mock("components/NotificationBanner", () => ({ default: () => null }));
vi.mock("react-select", () => ({
  default: ({ options, inputValue, onChange, onInputChange, ...props }) => (
    <div>
      <input
        aria-label={props["aria-label"]}
        value={inputValue}
        onChange={(event) =>
          onInputChange(event.target.value, { action: "input-change" })
        }
      />
      {options.map((option) => (
        <button key={option.value} onClick={() => onChange(option)}>
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

function response(status, data) {
  return {
    status,
    statusText: status === 204 ? "No Content" : "OK",
    json: vi.fn(async () => data),
  };
}

function developerProps(overrides = {}) {
  return {
    putNotifications: vi.fn(),
    getNotifications: vi.fn(),
    getSyncStatus: vi.fn(async () => ({
      lastUpdated: "2026-07-26T12:00:00Z",
      totalEvents: 4,
      subscribes: 2,
      unsubscribes: 1,
      profileUpdates: 1,
      cleaned: 0,
      recentEvents: [],
    })),
    systemBell: false,
    setSystemBell: vi.fn(),
    resetCache: vi.fn(),
    putUserPrefs: vi.fn(),
    getUserPrefs: vi.fn(),
    ...overrides,
  };
}

describe("Developer user role editor", () => {
  let httpClient;
  let eventRoleGranted;

  beforeEach(() => {
    eventRoleGranted = false;
    useAuthMock.mockReturnValue({
      user: { "https://gatool.org/roles": ["admin"] },
      getAccessToken: vi.fn(async () => "token"),
    });
    httpClient = {
      get: vi.fn(async (path) => {
        if (path === "system/roles") {
          return response(200, [
            {
              name: "firstglobal-write",
              label: "FIRST Global Write",
              description: "Create and update shared FIRST Global team data",
            },
          ]);
        }
        if (path.startsWith("system/users?")) {
          return response(200, [
            {
              email: "person+test@example.com",
              roles: eventRoleGranted ? ["user", "firstglobal-write"] : ["user"],
              createdAt: "2026-01-01T00:00:00Z",
              lastLoginAt: null,
            },
          ]);
        }
        throw new Error(`Unexpected GET ${path}`);
      }),
      put: vi.fn(async () => {
        eventRoleGranted = true;
        return response(200, {
          email: "person+test@example.com",
          roles: ["user", "firstglobal-write"],
          createdAt: "2026-01-01T00:00:00Z",
          lastLoginAt: null,
        });
      }),
      delete: vi.fn(async () => {
        eventRoleGranted = false;
        return response(200, {
          email: "person+test@example.com",
          roles: ["user"],
          createdAt: "2026-01-01T00:00:00Z",
          lastLoginAt: null,
        });
      }),
    };
    useAuthClientMock.mockReturnValue([httpClient, 0]);
  });

  it("searches users and immediately grants only a backend role", async () => {
    render(<Developer {...developerProps()} />);

    fireEvent.click(screen.getByRole("tab", { name: "User Management" }));
    expect(await screen.findByText("Total events: 4")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("User email"), {
      target: { value: "person+test" },
    });

    const userOption = await screen.findByRole("button", {
      name: "person+test@example.com",
    });
    expect(httpClient.get).toHaveBeenCalledWith(
      "system/users?query=person%2Btest&limit=20",
      30000,
      expect.any(AbortSignal)
    );
    fireEvent.click(userOption);

    const userRole = screen.getByLabelText(/User - Base application access/);
    const adminRole = screen.getByLabelText(/Admin - System administrator access/);
    const eventRole = screen.getByLabelText(
      /FIRST Global Write - Create and update shared FIRST Global team data/
    );
    expect(userRole).toBeDisabled();
    expect(userRole).toBeChecked();
    expect(adminRole).toBeDisabled();
    expect(eventRole).not.toBeDisabled();
    expect(eventRole).not.toBeChecked();

    fireEvent.click(eventRole);

    await waitFor(() => {
      expect(httpClient.put).toHaveBeenCalledWith(
        "system/users/person%2Btest%40example.com/roles/firstglobal-write"
      );
      expect(screen.getByText("FIRST Global Write granted.")).toBeInTheDocument();
      expect(eventRole).toBeChecked();
    });
    fireEvent.click(eventRole);

    await waitFor(() => {
      expect(httpClient.delete).toHaveBeenCalledWith(
        "system/users/person%2Btest%40example.com/roles/firstglobal-write"
      );
      expect(screen.getByText("FIRST Global Write revoked.")).toBeInTheDocument();
      expect(eventRole).not.toBeChecked();
    });
  });
});
