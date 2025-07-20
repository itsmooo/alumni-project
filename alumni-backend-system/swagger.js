const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Alumni Network Management System API',
    version: '1.0.0',
    description: 'A comprehensive API for managing alumni network with features including user management, events, announcements, payments, jobs, and more.',
    contact: {
      name: 'Alumni Network Team',
      email: 'support@alumninetwork.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.alumninetwork.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['alumni', 'admin', 'moderator'] },
          isActive: { type: 'boolean' },
          profile: {
            type: 'object',
            properties: {
              graduationYear: { type: 'number' },
              degree: { type: 'string' },
              major: { type: 'string' },
              profession: { type: 'string' },
              company: { type: 'string' },
              bio: { type: 'string' },
              profilePicture: { type: 'string' },
              location: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  country: { type: 'string' },
                },
              },
            },
          },
          verification: {
            type: 'object',
            properties: {
              isEmailVerified: { type: 'boolean' },
              isPhoneVerified: { type: 'boolean' },
            },
          },
          preferences: {
            type: 'object',
            properties: {
              emailNotifications: { type: 'boolean' },
              smsNotifications: { type: 'boolean' },
              pushNotifications: { type: 'boolean' },
              privacy: {
                type: 'object',
                properties: {
                  showEmail: { type: 'boolean' },
                  showPhone: { type: 'boolean' },
                  showLocation: { type: 'boolean' },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          lastLogin: { type: 'string', format: 'date-time' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['reunion', 'webinar', 'fundraiser', 'networking', 'workshop', 'social', 'other'] },
          date: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' },
            },
          },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['physical', 'virtual', 'hybrid'] },
              address: { type: 'string' },
              city: { type: 'string' },
              country: { type: 'string' },
              virtualUrl: { type: 'string' },
            },
          },
          organizer: { type: 'string' },
          capacity: { type: 'number' },
          attendeeCount: { type: 'number' },
          attendees: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: { type: 'string' },
                status: { type: 'string', enum: ['registered', 'attended', 'cancelled'] },
                registeredAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          registration: {
            type: 'object',
            properties: {
              required: { type: 'boolean' },
              deadline: { type: 'string', format: 'date-time' },
              fee: { type: 'number' },
            },
          },
          status: { type: 'string', enum: ['draft', 'published', 'cancelled', 'completed'] },
          isPublic: { type: 'boolean' },
          featured: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Announcement: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          author: { type: 'string' },
          category: { type: 'string', enum: ['general', 'jobs', 'news', 'scholarships', 'events', 'achievements', 'obituary'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          targetAudience: {
            type: 'object',
            properties: {
              isPublic: { type: 'boolean' },
              graduationYears: { type: 'array', items: { type: 'number' } },
              roles: { type: 'array', items: { type: 'string' } },
            },
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                url: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
          engagement: {
            type: 'object',
            properties: {
              views: { type: 'number' },
              likes: { type: 'array', items: { type: 'object' } },
              comments: { type: 'array', items: { type: 'object' } },
            },
          },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          publishDate: { type: 'string', format: 'date-time' },
          expiryDate: { type: 'string', format: 'date-time' },
          isPinned: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Job: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          company: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              logo: { type: 'string' },
              website: { type: 'string' },
              description: { type: 'string' },
              location: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  country: { type: 'string' },
                  isRemote: { type: 'boolean' },
                },
              },
            },
          },
          type: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship', 'volunteer'] },
          category: { type: 'string', enum: ['technology', 'healthcare', 'finance', 'education', 'marketing', 'sales', 'operations', 'other'] },
          experienceLevel: { type: 'string', enum: ['entry', 'mid', 'senior', 'executive'] },
          salary: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
              currency: { type: 'string' },
              period: { type: 'string', enum: ['hourly', 'monthly', 'annually'] },
            },
          },
          requirements: { type: 'array', items: { type: 'string' } },
          responsibilities: { type: 'array', items: { type: 'string' } },
          benefits: { type: 'array', items: { type: 'string' } },
          applicationMethod: { type: 'string', enum: ['email', 'website', 'phone', 'in_person'] },
          applicationContact: { type: 'string' },
          applicationUrl: { type: 'string' },
          applicationDeadline: { type: 'string', format: 'date-time' },
          postedBy: { type: 'string' },
          status: { type: 'string', enum: ['active', 'closed', 'draft'] },
          featured: { type: 'boolean' },
          views: { type: 'number' },
          applications: { type: 'array', items: { type: 'object' } },
          tags: { type: 'array', items: { type: 'string' } },
          expiresAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          type: { type: 'string', enum: ['membership', 'donation', 'event_ticket', 'merchandise'] },
          purpose: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          paymentMethod: { type: 'string', enum: ['hormuud', 'zaad', 'card', 'paypal', 'bank_transfer'] },
          paymentDetails: { type: 'object' },
          status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'] },
          receipt: {
            type: 'object',
            properties: {
              receiptNumber: { type: 'string' },
              issuedAt: { type: 'string', format: 'date-time' },
              downloadUrl: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              pages: { type: 'number' },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './routes/*.js',
    './server.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
}; 