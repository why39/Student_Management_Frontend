import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthProvider';
import { format } from 'date-fns';

// GraphQL queries and mutations
const GET_STUDENT_ACTIVITIES = gql`
  query GetStudentActivities {
    myActivitiesAsStudent {
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
      createdBy {
        id
        firstName
        lastName
      }
      attendees {
        id
        firstName
        lastName
      }
    }
  }
`;

const GET_JOINED_ACTIVITIES = gql`
  query GetJoinedActivities {
    myJoinedActivities {
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
      createdBy {
        id
        firstName
        lastName
      }
    }
  }
`;

const JOIN_ACTIVITY = gql`
  mutation JoinActivity($joinActivityInput: JoinActivityInput!) {
    joinActivity(joinActivityInput: $joinActivityInput) {
      id
      attendees {
        id
        firstName
        lastName
      }
    }
  }
`;

const StudentActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [joinedActivities, setJoinedActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'joined'>('available');
  const [error, setError] = useState('');

  // Queries
  const { 
    loading: loadingActivities, 
    error: errorActivities, 
    data: activitiesData, 
    refetch: refetchActivities 
  } = useQuery(GET_STUDENT_ACTIVITIES);

  const { 
    loading: loadingJoined, 
    error: errorJoined, 
    data: joinedData, 
    refetch: refetchJoined 
  } = useQuery(GET_JOINED_ACTIVITIES);

  // Mutation
  const [joinActivity, { loading: joiningActivity }] = useMutation(JOIN_ACTIVITY, {
    onCompleted: () => {
      refetchActivities();
      refetchJoined();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update state when data is loaded
  useEffect(() => {
    if (activitiesData && activitiesData.myActivitiesAsStudent) {
      setActivities(activitiesData.myActivitiesAsStudent);
    }
  }, [activitiesData]);

  useEffect(() => {
    if (joinedData && joinedData.myJoinedActivities) {
      setJoinedActivities(joinedData.myJoinedActivities);
    }
  }, [joinedData]);

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleJoinActivity = (activityId: string) => {
    joinActivity({
      variables: {
        joinActivityInput: {
          activityId,
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

  // Check if user has already joined an activity
  const hasJoined = (activity: any) => {
    return activity.attendees?.some((attendee: any) => attendee.id === user?.id);
  };

  if ((loadingActivities && !activities.length) || (loadingJoined && !joinedActivities.length)) {
    return <div className="text-center py-8">Loading activities...</div>;
  }
  
  if (errorActivities) {
    return <div className="text-center py-8 text-red-500">Error loading activities: {errorActivities.message}</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
          Activities
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          View and join activities from your groups.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('available')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Activities
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'joined'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Activities
          </button>
        </nav>
      </div>

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

      {/* Activities Display */}
      <div className="px-4 py-5 sm:p-6">
        {activeTab === 'available' ? (
          <>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Activities</h3>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No available activities found.
              </div>
            ) : (
              <div className="space-y-6">
                {activities
                  .filter(activity => (activity.state === 'NEW' || activity.state === 'IN_PROGRESS') && !hasJoined(activity))
                  .map((activity) => (
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
                          <div className="mt-2 text-xs text-gray-500">
                            Teacher: {activity.createdBy.firstName} {activity.createdBy.lastName}
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={() => handleJoinActivity(activity.id)}
                            disabled={joiningActivity}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {joiningActivity ? 'Joining...' : 'Join Activity'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">My Activities</h3>
            {joinedActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven't joined any activities yet.
              </div>
            ) : (
              <div className="space-y-6">
                {joinedActivities.map((activity) => (
                  <div key={activity.id} className="bg-gray-50 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
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
                      <div className="mt-2 text-xs text-gray-500">
                        Teacher: {activity.createdBy.firstName} {activity.createdBy.lastName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentActivities;
