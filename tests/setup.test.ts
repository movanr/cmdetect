import { createTestClients } from "./setup/graphql-client";
import { TestDataIds, TestUsers } from "@cmdetect/test-utils";
import { roles } from "@cmdetect/config";

describe("Test Setup Verification", () => {
  it("should have test accounts configured", () => {
    expect(TestUsers.org1Admin.email).toBe("admin1@test.com");
    expect(TestUsers.org1Admin.roles[0]).toBe(roles.ORG_ADMIN);
    expect(TestUsers.org1Physician.email).toBe("doctor1@test.com");
    expect(TestUsers.org1Physician.roles[0]).toBe(roles.PHYSICIAN);
  });

  it("should create authenticated GraphQL clients", async () => {
    const clients = await createTestClients();
    expect(clients.admin).toBeTruthy();
    expect(clients.org1Admin).toBeTruthy();
    expect(clients.org1Physician).toBeTruthy();
    expect(clients.org1Receptionist).toBeTruthy();
    expect(clients.org2Admin).toBeTruthy();
    expect(clients.org2Physician).toBeTruthy();
  });

  it("should have test data IDs configured", () => {
    expect(TestDataIds.organizations.org1).toBe(
      "11111111-1111-1111-1111-111111111111"
    );
    expect(TestDataIds.organizations.org2).toBe(
      "22222222-2222-2222-2222-222222222222"
    );
    expect(TestDataIds.organizations.org3).toBe(
      "33333333-3333-3333-3333-333333333333"
    );
    expect(TestDataIds.users.org1Admin).toBe(
      "4gLI1mnAaxP91SdpIDWmPf8RDKou5vHC"
    );
  });
});
