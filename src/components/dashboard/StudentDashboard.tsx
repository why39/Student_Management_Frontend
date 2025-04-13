import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthProvider';

// GraphQL query for fetching the student's groups
const GET_STUDENT_GROUPS = gql`
  query GetStudentGroups {
    myStudentGroups {
      id
      name
      description
      owner {
        id
        firstName
        lastName
        email
      }
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

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_STUDENT_GROUPS);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.myStudentGroups) {
      setGroups(data.myStudentGroups);
    }
  }, [data]);

  if (loading) return <div className="text-center py-8">Loading your groups...</div>;
  
  if (error) return <div className="text-center py-8 text-red-500">Error loading your groups: {error.message}</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
          Student Dashboard
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome back, {user?.firstName}! Here are your groups.
        </p>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You are not a member of any groups yet.
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Groups</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div key={group.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h4 className="text-lg font-semibold">{group.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{group.description || 'No description'}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Teacher</p>
                    <p className="text-sm text-gray-900">{group.owner.firstName} {group.owner.lastName}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Your Role</p>
                    <p className="text-sm text-gray-900">
                      {group.members.find((member: any) => member.user.id === user?.id)?.role === 'GROUP_LEADER' 
                        ? 'Group Leader' 
                        : 'Member'}
                    </p>
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

export default StudentDashboard;