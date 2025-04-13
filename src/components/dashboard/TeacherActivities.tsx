import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthProvider';
import { format } from 'date-fns';

// GraphQL queries and mutations for activities
const GET_TEACHER_ACTIVITIES = gql`
  query GetTeacherActivities {
    myActivitiesAsTeacher {
      id
      title
      description
      scheduledAt
      createdAt
      state
      location
      group {
        id
        name
      }
      attendees {
        id
        firstName
        lastName
      }
    }
  }
`;

const GET_TEACHER_GROUPS = gql`
  query GetTeacherGroups {
    myGroups {
      id
      name
      description
    }
  }
`;

const CREATE_ACTIVITY = gql`
  mutation CreateActivity($createActivityInput: CreateActivityInput!) {
    createActivity(createActivityInput: $createActivityInput) {
      id
      title
      description
      scheduledAt
      state
    }
  }
`;

const UPDATE_ACTIVITY_STATE = gql`
  mutation UpdateActivityState($updateActivityStateInput: UpdateActivityStateInput!) {
    updateActivityState(updateActivityStateInput: $updateActivityStateInput) {
      id
      state
    }
  }
`;

const TeacherActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    groupId: '',
    scheduledAt: new Date().toISOString().slice(0, 16),
    location: '',
    state: 'NEW'
  });

  // Fetch activities and groups
  const { loading: loadingActivities, error: errorActivities, data: activitiesData, refetch: refetchActivities } = 
    useQuery(GET_TEACHER_ACTIVITIES);
  const { loading: loadingGroups, error: errorGroups, data: groupsData } = 
    useQuery(GET_TEACHER_GROUPS);

  // Mutations
  const [createActivity, { loading: creatingActivity }] = useMutation(CREATE_ACTIVITY, {
    onCompleted: () => {
      setShowCreateActivity(false);
      setFormData({
        title: '',
        description: '',
        groupId: '',
        scheduledAt: new Date().toISOString().slice(0, 16),
        location: '',
        state: 'NEW'
      });
      refetchActivities();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [updateActivityState] = useMutation(UPDATE_ACTIVITY_STATE, {
    onCompleted: () => {
      refetchActivities();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update state when data is loaded
  useEffect(() => {
    if (activitiesData && activitiesData.myActivitiesAsTeacher) {
      setActivities(activitiesData.myActivitiesAsTeacher);
    }
  }, [activitiesData]);

  useEffect(() => {
    if (groupsData && groupsData.myGroups) {
      setGroups(groupsData.myGroups);
    }
  }, [groupsData]);

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Form handlers
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity({
      variables: {
        createActivityInput: {
          ...formData,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        },
      },
    });
  };

  const handleUpdateState = (activityId: string, newState: string) => {
    updateActivityState({
      variables: {
        updateActivityStateInput: {
          activityId,
          state: newState,
        },
      },
    });
  };

  // Helper functions
  const getStateColor = (state: string) => {
    switch (state) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (loadingActivities && !activities.length) return <div className="text-center py-8">Loading your activities...</div>;
  
  if (errorActivities) return <div className="text-center py-8 text-red-500">Error loading your activities: {errorActivities.message}</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
            Activities
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Create and manage activities for your student groups.
          </p>
        </div>
        <button
          onClick={() => setShowCreateActivity(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Activity
        </button>
      </div>

      {/* Create Activity Modal */}
      {showCreateActivity && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateActivity}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Activity Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">Select Group</label>
                    <select
                      id="groupId"
                      name="groupId"
                      required
                      value={formData.groupId}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">Date and Time</label>
                    <input
                      type="datetime-local"
                      id="scheduledAt"
                      name="scheduledAt"
                      required
                      value={formData.scheduledAt}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleCreateFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={creatingActivity}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {creatingActivity ? 'Creating...' : 'Create Activity'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateActivity(false)}
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

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You haven't created any activities yet. Click "Create Activity" to get started.
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Activities</h3>
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-gray-50 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold">{activity.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(activity.state)}`}>
                        {activity.state.replace('_', ' ')}
                      </span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {formatDateTime(activity.scheduledAt)}
                      </span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {activity.group.name}
                      </span>
                      {activity.location && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {activity.state === 'NEW' && (
                      <button
                        onClick={() => handleUpdateState(activity.id, 'IN_PROGRESS')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Start
                      </button>
                    )}
                    {activity.state === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateState(activity.id, 'COMPLETED')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Complete
                      </button>
                    )}
                    {(activity.state === 'NEW' || activity.state === 'IN_PROGRESS') && (
                      <button
                        onClick={() => handleUpdateState(activity.id, 'CANCELED')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Attendees */}
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Attendees</h5>
                    
                    {activity.attendees?.length === 0 ? (
                      <p className="text-sm text-gray-500">No attendees yet.</p>
                    ) : (
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {activity.attendees?.map((attendee: any) => (
                          <li key={attendee.id} className="px-4 py-2 bg-white shadow rounded-md">
                            <p className="text-sm font-medium text-gray-900">
                              {attendee.firstName} {attendee.lastName}
                            </p>
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

export default TeacherActivities;
