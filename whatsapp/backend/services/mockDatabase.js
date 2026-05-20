// Mock database for testing without MongoDB
// This is a temporary solution until MongoDB is set up

const users = [];
const leads = [];
const messages = [];
const subscriptions = [];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// User operations
const User = {
  findOne: async (query) => {
    return users.find(u => 
      (query.email && u.email === query.email) ||
      (query.phoneNumber && u.phoneNumber === query.phoneNumber)
    ) || null;
  },
  findById: async (id) => {
    return users.find(u => u._id === id) || null;
  },
  create: async (data) => {
    const user = {
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    users.push(user);
    return user;
  },
  updateOne: async (filter, update) => {
    const user = users.find(u => 
      (filter.email && u.email === filter.email) ||
      (filter._id && u._id === filter._id)
    );
    if (user) {
      Object.assign(user, update, { updatedAt: new Date() });
      return user;
    }
    return null;
  }
};

// Lead operations
const Lead = {
  findOne: async (query) => {
    return leads.find(l => 
      (query.phoneNumber && l.phoneNumber === query.phoneNumber) ||
      (query._id && l._id === query._id)
    ) || null;
  },
  find: async (query = {}) => {
    return leads.filter(l => {
      if (query.assignedTo && l.assignedTo !== query.assignedTo) return false;
      if (query.status && l.status !== query.status) return false;
      return true;
    });
  },
  findById: async (id) => {
    return leads.find(l => l._id === id) || null;
  },
  create: async (data) => {
    const lead = {
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    leads.push(lead);
    return lead;
  },
  updateOne: async (filter, update) => {
    const lead = leads.find(l => 
      (filter._id && l._id === filter._id)
    );
    if (lead) {
      Object.assign(lead, update, { updatedAt: new Date() });
      return lead;
    }
    return null;
  }
};

// Message operations
const Message = {
  create: async (data) => {
    const message = {
      _id: generateId(),
      createdAt: new Date(),
      ...data
    };
    messages.push(message);
    return message;
  },
  find: async (query) => {
    return messages.filter(m => 
      (query.leadId && m.leadId === query.leadId)
    );
  }
};

// Subscription operations
const Subscription = {
  findOne: async (query) => {
    return subscriptions.find(s => 
      (query.userId && s.userId === query.userId)
    ) || null;
  },
  create: async (data) => {
    const subscription = {
      _id: generateId(),
      createdAt: new Date(),
      ...data
    };
    subscriptions.push(subscription);
    return subscription;
  }
};

module.exports = {
  User,
  Lead,
  Message,
  Subscription
};
