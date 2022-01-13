import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { TRY_LOGIN } from '../queries'

const LoginForm = (props) => {

  const [ username, setUsername ] = useState('')
  const [ password, setPassword ] = useState('')

  const [ tryLogin ] = useMutation(TRY_LOGIN)

  const submit = async (event) => {
    event.preventDefault()
    console.log("TRYING TO LOG IN ")
    const response = await tryLogin({ variables: { username, password }})
    
    console.log("response: ")
    console.log(response)
    console.log("that was response :)")

    const token = response.data.login.value

    setUsername('')
    setPassword('')

    props.loginSuccessful(token)

  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>Username: <input value={username} onChange={(event) => setUsername(event.target.value)} /></div>
        <div>Password: <input value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <button>Login</button>
      </form>
    </div>
  )

}

export default LoginForm