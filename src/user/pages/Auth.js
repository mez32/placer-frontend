import React, { useContext, useState } from 'react'

import Card from '../../shared/components/UIElements/Card'
import Button from '../../shared/components/formElements/Button'
import Input from '../../shared/components/formElements/Input'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadindSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ImageUpload from '../../shared/components/formElements/ImageUpload'
import { useForm } from '../../shared/hooks/form-hook'
import { useHttpClient } from '../../shared/hooks/http-hook'
import {
	VALIDATOR_EMAIL,
	VALIDATOR_MINLENGTH,
	VALIDATOR_REQUIRE,
} from '../../shared/utils/validators'
import { AuthContext } from '../../shared/context/auth-context'

import './Auth.css'

const Auth = () => {
	const auth = useContext(AuthContext)
	const [isLoginMode, setIsLoginMode] = useState(true)
	const { isLoading, error, sendRequest, clearError } = useHttpClient()

	const [formState, InputHandler, setFormData] = useForm(
		{
			email: {
				value: '',
				isValid: false,
			},
			password: {
				value: '',
				isValid: false,
			},
		},
		false
	)

	const switchModeHandler = () => {
		if (!isLoginMode) {
			setFormData(
				{
					...formState.inputs,
					name: undefined,
					image: undefined,
				},
				formState.inputs.email.isValid && formState.inputs.password.isValid
			)
		} else {
			setFormData(
				{
					...formState.inputs,
					name: {
						value: '',
						isValid: false,
					},
					image: {
						value: null,
						isValid: false,
					},
				},
				false
			)
		}
		setIsLoginMode((prevMode) => !prevMode)
	}

	const authSubmitHandler = async (event) => {
		event.preventDefault()

		if (isLoginMode) {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/users/login',
					'POST',
					JSON.stringify({
						email: formState.inputs.email.value,
						password: formState.inputs.password.value,
					}),
					{
						'Content-Type': 'application/json',
					}
				)
				auth.login(responseData.userId, responseData.token)
			} catch (err) {}
		} else {
			try {
				const formData = new FormData()
				formData.append('email', formState.inputs.email.value)
				formData.append('name', formState.inputs.name.value)
				formData.append('password', formState.inputs.password.value)
				formData.append('image', formState.inputs.image.value)
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/users/signup',
					'POST',
					formData
				)

				auth.login(responseData.userId, responseData.token)
			} catch (err) {}
		}
	}

	return (
		<>
			<ErrorModal error={error} onClear={clearError} />
			<Card className='authentication'>
				{isLoading && <LoadindSpinner asOverlay />}
				<h2>Login Required</h2>
				<hr />
				<form onSubmit={authSubmitHandler}>
					{!isLoginMode && (
						<Input
							id='name'
							element='input'
							type='text'
							label='Your Name'
							validators={[VALIDATOR_REQUIRE()]}
							errorText='Please enter your name!'
							onInput={InputHandler}
						/>
					)}
					{!isLoginMode && (
						<ImageUpload
							center
							id='image'
							onInput={InputHandler}
							errorText='Please provide an image'
						/>
					)}
					<Input
						id='email'
						element='input'
						type='email'
						label='Email'
						validators={[VALIDATOR_EMAIL()]}
						errorText='Please enter a valid email'
						onInput={InputHandler}
					/>
					<Input
						id='password'
						element='input'
						type='text'
						label='Password'
						validators={[VALIDATOR_MINLENGTH(6)]}
						errorText='Please enter a valid password (6 characters min.)'
						onInput={InputHandler}
					/>
					<Button type='submit' disabled={!formState.isValid}>
						{isLoginMode ? 'LOGIN' : 'SIGN UP'}
					</Button>
				</form>
				<Button inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGN UP' : 'LOGIN'}
				</Button>
			</Card>
		</>
	)
}

export default Auth
