import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthProvider';
import '../../styles/animations.css'; // Import the animations CSS file

// GraphQL queries and mutations for teacher operations
const GET_TEACHER_GROUPS = gql`
  query GetTeacherGroups {
    myGroups {
      id
      name
      description
      members {
        id
        role
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    studentUsers {
      id
      firstName
      lastName
      email
    }
  }
`;

const CREATE_GROUP = gql`
  mutation CreateGroup($createGroupInput: CreateGroupInput!) {
    createGroup(createGroupInput: $createGroupInput) {
      id
      name
      description
    }
  }
`;

const ADD_GROUP_MEMBER = gql`
  mutation AddGroupMember($addGroupMemberInput: AddGroupMemberInput!) {
    addGroupMember(addGroupMemberInput: $addGroupMemberInput) {
      id
      role
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

const REMOVE_GROUP_MEMBER = gql`
  mutation RemoveGroupMember($groupId: ID!, $userId: ID!) {
    removeGroupMember(groupId: $groupId, userId: $userId)
  }
`;

const REMOVE_GROUP = gql`
  mutation RemoveGroup($id: ID!) {
    removeGroup(id: $id) {
      id
      name
    }
  }
`;

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [addStudentData, setAddStudentData] = useState({
    studentId: '',
    role: 'COMMON_MEMBER',
  });

  // Queries and mutations
  const { loading: loadingGroups, error: errorGroups, data: groupsData, refetch: refetchGroups } = useQuery(GET_TEACHER_GROUPS);
  const { loading: loadingStudents, error: errorStudents, data: studentsData } = useQuery(GET_STUDENTS);
  const [error, setError] = useState('');
  
  const [createGroup, { loading: creatingGroup }] = useMutation(CREATE_GROUP, {
    onCompleted: () => {
      setShowCreateGroup(false);
      setFormData({ name: '', description: '' });
      refetchGroups();
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  
  const [addGroupMember, { loading: addingMember }] = useMutation(ADD_GROUP_MEMBER, {
    onCompleted: () => {
      setShowAddStudent(false);
      setAddStudentData({ studentId: '', role: 'COMMON_MEMBER' });
      refetchGroups();
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  
  const [removeGroupMember] = useMutation(REMOVE_GROUP_MEMBER, {
    onCompleted: () => {
      refetchGroups();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [removeGroup] = useMutation(REMOVE_GROUP, {
    onCompleted: () => {
      refetchGroups();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update state when data is loaded
  useEffect(() => {
    if (groupsData && groupsData.myGroups) {
      setGroups(groupsData.myGroups);
    }
  }, [groupsData]);

  useEffect(() => {
    if (studentsData && studentsData.studentUsers) {
      setStudents(studentsData.studentUsers);
    }
  }, [studentsData]);

  // Form handlers
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddStudentData({ ...addStudentData, [name]: value });
  };

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000); // 5 seconds
      
      // Clean up the timer if the component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup({
      variables: {
        createGroupInput: formData,
      },
    });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    
    addGroupMember({
      variables: {
        addGroupMemberInput: {
          groupId: selectedGroup.id,
          userId: addStudentData.studentId,
          role: addStudentData.role,
        },
      },
    });
  };

  const handleRemoveStudent = (groupId: string, userId: string) => {
    if (window.confirm('Are you sure you want to remove this student from the group?')) {
      removeGroupMember({
        variables: {
          groupId,
          userId,
        },
      });
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to remove this group? This action cannot be undone and all member associations will be deleted.')) {
      removeGroup({
        variables: {
          id: groupId,
        },
      });
    }
  };

  // Loading and error states
  if (loadingGroups && !groups.length) return <div className="text-center py-8">Loading your groups...</div>;
  
  if (errorGroups) return <div className="text-center py-8 text-red-500">Error loading your groups: {errorGroups.message}</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
            Teacher Dashboard
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Welcome back, {user?.firstName}! Manage your student groups.
          </p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Group
        </button>
      </div>
      
      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateGroup}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={creatingGroup}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {creatingGroup ? 'Creating...' : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Popup */}
      {error && (
        <div className="fixed z-50 top-4 right-4 w-80 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg rounded-md animate-fade-in-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Error</span>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && selectedGroup && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddStudent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Add Student to {selectedGroup.name}
                  </h3>
                  <div className="mb-4">
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Select Student</label>
                    <select
                      id="studentId"
                      name="studentId"
                      required
                      value={addStudentData.studentId}
                      onChange={handleAddStudentChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={addStudentData.role}
                      onChange={handleAddStudentChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="GROUP_LEADER">Group Leader</option>
                      <option value="COMMON_MEMBER">Common Member</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={addingMember}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {addingMember ? 'Adding...' : 'Add Student'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStudent(false);
                      setSelectedGroup(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You haven't created any groups yet. Click "Create Group" to get started.
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Groups</h3>
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-gray-50 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold">{group.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{group.description || 'No description'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowAddStudent(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Student
                    </button>
                    <button
                      onClick={() => handleRemoveGroup(group.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove Group
                    </button>
                  </div>
                </div>

                {/* Group Members */}
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Group Members</h5>
                    
                    {group.members.length === 0 ? (
                      <p className="text-sm text-gray-500">No members in this group yet.</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {group.members.map((member: any) => (
                          <li key={member.id} className="py-4 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.user.firstName} {member.user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{member.user.email}</p>
                              <p className="text-xs text-indigo-600 mt-1">
                                {member.role === 'GROUP_LEADER' ? 'Group Leader' : 'Member'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(group.id, member.user.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;