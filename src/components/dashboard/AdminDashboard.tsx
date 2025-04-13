import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthProvider';

// GraphQL queries and mutations for admin operations
const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      email
      firstName
      lastName
      role
      createdAt
    }
  }
`;

const GET_ALL_GROUPS = gql`
  query GetAllGroups {
    groups {
      id
      name
      description
      createdAt
      owner {
        id
        firstName
        lastName
        email
      }
      members {
        id
        user {
          id
          firstName
          lastName
        }
        role
      }
    }
  }
`;

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

  // Fetch users and groups data
  const { loading: loadingUsers, error: errorUsers, data: usersData } = useQuery(GET_ALL_USERS);
  const { loading: loadingGroups, error: errorGroups, data: groupsData } = useQuery(GET_ALL_GROUPS);

  // Update state when data is loaded
  useEffect(() => {
    if (usersData && usersData.users) {
      setUsers(usersData.users);
    }
  }, [usersData]);

  useEffect(() => {
    if (groupsData && groupsData.groups) {
      setGroups(groupsData.groups);
    }
  }, [groupsData]);

  // Render users tab
  const renderUsersTab = () => {
    if (loadingUsers && !users.length) return <div className="text-center py-8">Loading users...</div>;
  
    if (errorUsers) return <div className="text-center py-8 text-red-500">Error loading users: {errorUsers.message}</div>;

    return (
      <div className="mt-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Users</h3>
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'TEACHER' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render groups tab
  const renderGroupsTab = () => {
    if (loadingGroups && !groups.length) return <div className="text-center py-8">Loading groups...</div>;
  
    if (errorGroups) return <div className="text-center py-8 text-red-500">Error loading groups: {errorGroups.message}</div>;

    return (
      <div className="mt-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Groups</h3>
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center">No groups have been created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div key={group.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h4 className="text-lg font-semibold">{group.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{group.description || 'No description'}</p>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Owner</p>
                    <p className="text-sm text-gray-900">
                      {group.owner.firstName} {group.owner.lastName} ({group.owner.email})
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">{new Date(group.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Members ({group.members.length})</p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {group.members.length === 0 ? (
                        <p className="text-sm text-gray-500">No members</p>
                      ) : (
                        <ul className="space-y-2">
                          {group.members.map((member: any) => (
                            <li key={member.id} className="text-sm">
                              <span className="font-medium">{member.user.firstName} {member.user.lastName}</span>
                              <span className="text-xs ml-1 text-indigo-600">
                                ({member.role === 'GROUP_LEADER' ? 'Leader' : 'Member'})
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
          Admin Dashboard
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome, {user?.firstName}! You have full administrative access.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Groups
          </button>
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="px-4 py-5 sm:p-6">
        {activeTab === 'users' ? renderUsersTab() : renderGroupsTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;