import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { ToastContainer, toast } from "react-toastify";
import { useAuthHeader } from "react-auth-kit";
import { Link, useNavigate } from "react-router-dom";
import { CgMathPlus } from "react-icons/cg";
import { getUserPostsApi } from "../../api/userPost";
import { deletePostApi, getPostsApi } from "../../api/post";
import { useTheme } from "../../context/ThemeContext";
import { usePermify } from "@permify/react-role";
import { BsDashLg } from "react-icons/bs";
import { getUsersApi } from "../../api/user";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { getRolesApi, grantAccessApi } from "../../api/roles";

export function GrantAccessModal(props) {
  const { show, setShow, user, rolesResponse, dataUpdated } = props;

  const { isAuthorized, isLoading } = usePermify();

  const authHeader = useAuthHeader();

  const [roles, setRoles] = useState([]);

  const [selectedRoles, setSelectedRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setRoles(rolesResponse);
  }, [rolesResponse]);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles);
    }
  }, [user]);

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    const role = roles.find((r) => r.id === roleId);
    if (selectedRoles.map((r) => r.id).includes(roleId)) {
      setSelectedRoles((prevRoles) => prevRoles.filter((r) => r.id !== roleId));
    } else {
      setSelectedRoles((prevRoles) => [...prevRoles, role]);
    }
  }

  const handleGrantAccess = async () => {
    setLoading(true);
    setError(null);

    const userData = {
      ...user,
      roles: selectedRoles.map((r) => r.name),
    };

    const response = await grantAccessApi(authHeader(), userData);
    if (response.status === "success") {
      toast.success(response.message);
      dataUpdated();
      setShow(false);
    } else {
      console.error("Error granting access:", response);
      setError(response.message);
    }
    setLoading(false);
  }

  return (
    <>
      {
        show && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">

                      <div className="mt-2">
                        <div className="mt-1">
                          <div className="flex flex-col space-y-2">
                            {
                              roles && roles.map((role) => (
                                <label key={role.id} className="inline-flex items-center">
                                  <input type="checkbox" onChange={handleRoleChange} value={role.id} className="form-checkbox h-4 w-4 text-orange-600 accent-orange-500" checked={selectedRoles.map((r) => r.id).includes(role.id)} />
                                  <span className="capitalize ml-2 text-gray-700">{role.name}</span>
                                </label>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button onClick={handleGrantAccess} disabled={loading} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm">
                    {
                      loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : 'Grant Access'
                    }
                  </button>
                  <button onClick={() => setShow(false)} type="button" className="mt-3
                    w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        )
      }
    </>
  )
}

export function SingleUser(props) {
  const { user, roles, dataUpdated } = props;

  const [showGrantAccessModal, setShowGrantAccessModal] = useState(false);

  return (
    <li key={user.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900 capitalize">{user.first_name + ' ' + user.last_name}</h3>
            {
              user.roles.map((role) => (
                <span key={role.id} className="inline-flex capitalize flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">

                  {role.name}
                </span>
              ))
            }
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">{user.email}</p>
        </div>
        <button className="group cursor-pointer h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full transition-all outline outline-1 outline-orange-50 hover:outline-orange-500 bg-orange-50"
          onClick={() => setShowGrantAccessModal(true)}
        >
          <LockClosedIcon className="h-4 w-4 text-orange-500" aria-hidden="true" />
        </button>
      </div>

      <GrantAccessModal show={showGrantAccessModal} setShow={setShowGrantAccessModal} user={user} rolesResponse={roles} dataUpdated={dataUpdated} />
    </li>
  )
}

export default function UsersIndexPage() {
  const { isAuthorized, isLoading } = usePermify();

  const authHeader = useAuthHeader();
  const [users, setUsers] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await getRolesApi(authHeader());
      if (response.status === "success") {
        setRoles(response.response.roles);
      } else {
        console.error("Error fetching roles:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleDeleteClick = (postId) => {
    setPostIdToDelete(postId);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (postIdToDelete) {
      const response = await deletePostApi(authHeader(), postIdToDelete);
      if (response.status === "success") {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postIdToDelete));
        toast.success(response.message);
      } else {
        console.error("Error deleting post:", response);
        toast.error(response.message);
      }
    }
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    fetchUsersData();
    fetchRoles();
  }, []);


  const fetchUsersData = async () => {
    if (!await isAuthorized(["admin", "super-admin"], [])) {
      navigate('/')
    };

    try {
      const response = await getUsersApi(authHeader());
      if (response.status === "success") {
        setUsers(response.response.users);
      } else {
        console.error("Error fetching user data:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  function dataUpdated() {
    console.log('now');
    fetchUsersData();
  }

  return (
    <>
      <Helmet>
        <title>DSS | Users</title>
      </Helmet>

      <Header />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="h-screen bg-opacity-0 bg-transparent">

        <section className="max-w-7xl mx-auto my-[50px]">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-lg font-semibold leading-6 text-neutral-900">Users</h1>
                <p className="mt-2 text-sm text-gray-700">
                  A list of all users for edit and delete.
                </p>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {
                      users && users.map((user) => (
                        <SingleUser key={user.id} user={user} roles={roles} dataUpdated={dataUpdated} />
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
