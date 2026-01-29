import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Search as SearchIcon,
  X,
  ChevronDown
} from 'lucide-react';
import { TourAdminContext } from '../../context/TourAdminContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersData = () => {
  const { allUsers, getAllUsers, aToken } = useContext(TourAdminContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // duplicate toast தடுக்க

  const dropdownRef = useRef(null);

  // Fetch users only once & show toast only once
  useEffect(() => {
    if (aToken && !hasShownToast) { // hasShownToast false இருந்தா மட்டும் run
      getAllUsers()
        .then(() => {
          if (allUsers && allUsers.length > 0) {
            toast.success(`Loaded ${allUsers.length} users`, {
              toastId: "users-loaded", // ← unique ID கொடுத்து duplicate தடுக்க
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          } else {
            toast.info("No users found", {
              toastId: "no-users",
              position: "top-right",
              autoClose: 3000,
            });
          }
          setHasShownToast(true); // இப்போ toast காட்டிட்டோம் — மறுபடியும் காட்டாது
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users", { toastId: "fetch-error" });
          setHasShownToast(true);
        });
    }
  }, [aToken, getAllUsers, hasShownToast]); // allUsers dependency remove பண்ணலாம், ஆனா hasShownToast control பண்ணுது

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setGenderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = 
      !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === 'all' || user.gender === genderFilter;
    const matchesPhone = 
      !phoneFilter ||
      user.phone?.toLowerCase().includes(phoneFilter.toLowerCase());

    return matchesSearch && matchesGender && matchesPhone;
  }) || [];

  const clearFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setPhoneFilter('');
  };

  const hasFilters = searchTerm || genderFilter !== 'all' || phoneFilter !== '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-10 h-10 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">
              {allUsers?.length || 0} registered users • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Search */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Search by Name or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              />
              <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>

          {/* Gender Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Gender
            </label>
            <div 
              onClick={() => setGenderOpen(!genderOpen)}
              className="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl cursor-pointer flex justify-between items-center hover:border-indigo-500 transition-all shadow-sm"
            >
              <span>{genderFilter === 'all' ? 'All Genders' : genderFilter}</span>
              <ChevronDown className={`text-gray-500 transition-transform ${genderOpen ? 'rotate-180' : ''}`} size={16} />
            </div>

            {genderOpen && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                {['all', 'Male', 'Female', 'Other', 'Not Selected'].map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      setGenderFilter(opt);
                      setGenderOpen(false);
                    }}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-indigo-50 cursor-pointer transition-colors text-xs sm:text-sm"
                  >
                    {opt === 'all' ? 'All Genders' : opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Search phone number..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              />
              <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>

          {/* Clear Button */}
          {hasFilters && (
            <div className="self-end w-full sm:w-auto">
              <button
                onClick={clearFilters}
                className="
                  w-full sm:w-auto px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold 
                  bg-gradient-to-r from-indigo-500 to-indigo-600 
                  text-white rounded-xl shadow-md 
                  flex items-center gap-2 justify-center 
                  hover:from-indigo-600 hover:to-indigo-700 
                  transition-all duration-300
                "
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {allUsers && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider w-16 sm:w-20">
                    Photo
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Name & Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user._id}
                    className="hover:bg-indigo-50/30 transition-colors duration-200"
                  >
                    <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                      {user.image && user.image.includes('http') ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-indigo-100 shadow-md"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=6366f1&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg sm:text-xl shadow-md">
                          {(user.name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="text-sm sm:text-base font-medium text-gray-900">
                        {user.name || '—'}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1 sm:gap-2">
                        <Mail size={14} className="text-indigo-500" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-700 font-medium">
                      {user.phone || 'Not provided'}
                    </td>

                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-700">
                      {user.gender || 'Not selected'}
                    </td>

                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-700">
                      {user.address?.line1 || user.address?.line2
                        ? `${user.address.line1 || ''} ${user.address.line2 || ''}`.trim()
                        : 'No address'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No results */}
      {allUsers && filteredUsers.length === 0 && (
        <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
          <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            No matching users
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersData;