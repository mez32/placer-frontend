import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import Input from '../../shared/components/formElements/Input'
import Button from '../../shared/components/formElements/Button'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ImageUpload from '../../shared/components/formElements/ImageUpload'
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import { useForm } from '../../shared/hooks/form-hook'
import { useHttpClient } from '../../shared/hooks/http-hook'
import { AuthContext } from '../../shared/context/auth-context'
import './PlaceForm.css'

const NewPlace = () => {
	const auth = useContext(AuthContext)
	const { isLoading, error, sendRequest, clearError } = useHttpClient()
	const [formState, InputHandler] = useForm(
		{
			title: {
				value: '',
				isValid: false,
			},
			description: {
				value: '',
				isValid: false,
			},
			address: {
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

	const history = useHistory()

	const placeSubmitHandler = async (event) => {
		event.preventDefault()
		try {
			const formData = new FormData()
			formData.append('title', formState.inputs.title.value)
			formData.append('description', formState.inputs.description.value)
			formData.append('address', formState.inputs.address.value)
			formData.append('image', formState.inputs.image.value)
			await sendRequest(process.env.REACT_APP_BACKEND_URL + '/places', 'POST', formData, {
				Authorization: 'Bearer ' + auth.token,
			})
			history.push('/')
		} catch (err) {}
	}

	return (
		<>
			<ErrorModal error={error} onClear={clearError} />
			<form className='place-form' onSubmit={placeSubmitHandler}>
				{isLoading && <LoadingSpinner asOverlay />}
				<Input
					id='title'
					element='input'
					type='text'
					label='Title'
					validators={[VALIDATOR_REQUIRE()]}
					errorText='Please entere a valid title'
					onInput={InputHandler}
				/>
				<Input
					id='description'
					element='textarea'
					label='Description'
					validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(5)]}
					errorText='Please entere a valid description (min length of 5)'
					onInput={InputHandler}
				/>
				<Input
					id='address'
					element='input'
					type='text'
					label='Address'
					validators={[VALIDATOR_REQUIRE()]}
					errorText='Please entere a valid address'
					onInput={InputHandler}
				/>
				<ImageUpload id='image' onInput={InputHandler} errorText='Please provide an image' />
				<Button type='submit' disabled={!formState.isValid}>
					ADD PLACE
				</Button>
			</form>
		</>
	)
}

export default NewPlace
