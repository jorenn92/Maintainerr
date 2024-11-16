import { RefreshIcon, SaveIcon } from '@heroicons/react/solid'
import { InformationCircleIcon } from '@heroicons/react/solid'
import React, { useContext, useEffect, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import GetApiHandler, { PostApiHandler } from '../../../utils/ApiHandler'

interface RandomData {
  firstName: string
  version: string
  commitTag: string
  updateAvailable: boolean
}

const AboutSettings = () => {
  useEffect(() => {
    document.title = 'Maintainerr - Settings - Blank'
  }, [])

  const [userData, setUserData] = useState(null)
  useEffect(() => {
    fetch('https://random-data-api.com/api/users/random_user')
      .then((response) => response.json())
      .then((data) => setUserData(data))
  }, [])

  return (
    <div>
      {userData && (
        <div>
          <h2>User Information</h2>
          <p>
            Name:
            {userData.first_name}
            {userData.last_name}
          </p>
          <p>Email: {userData.email}</p>
          <p>Password: {userData.password}</p>
          {/* Add more user data fields as needed */}
        </div>
      )}
    </div>
  )
}

export default AboutSettings
