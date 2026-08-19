import Session from "./session.model.js";

// ============================================================
// CREATE SESSION
// ============================================================

export const createSession = async (sessionData) => {
  return Session.create(sessionData);
};


// ============================================================
// FIND ACTIVE SESSION
// ============================================================

export const findActiveSession = async (sessionId) => {
  return Session.findOne({
    _id: sessionId,
    isRevoked: false,
  });
};


// ============================================================
// REVOKE SESSION
// ============================================================

export const revokeSession = async (sessionId) => {
  return Session.findByIdAndUpdate(
    sessionId,
    {
      isRevoked: true,
      revokedAt: new Date(),
    },
    {
      new: true,
    }
  );
};


// ============================================================
// REVOKE ALL CUSTOMER SESSIONS
// ============================================================

export const revokeAllCustomerSessions = async (
  customerId
) => {
  return Session.updateMany(
    {
      customerId,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    }
  );
};