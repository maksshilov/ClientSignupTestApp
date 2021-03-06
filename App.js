import React, { useReducer, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Button, Checkbox, RadioButton, TextInput } from 'react-native-paper'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import axios from 'axios'
// src
import { windowWidth } from './src/styles/variables'
import ModalPopup from './src/components/Modal'
import Error from './src/components/Error'
import Divider from './src/components/Divider'
// BODY

const SET_FORM = 'SET_FORM'
const RESET_STATE = 'RESET_STATE'
const RESET_BIRTH_DATE = 'RESET_BIRTH_DATE'
const SET_LOADING = 'SET_LOADING'
const SET_MODAL = 'SET_MODAL'

const formReducer = (state, action) => {
  switch (action.type) {
    case SET_FORM:
      const updatedValues = {
        ...state.inputValues,
        [action.input]: action.value,
      }

      let updatedValidities = state.inputValidities
      if (
        action.input === 'firstName' ||
        action.input === 'lastName' ||
        action.input === 'thirdName' ||
        action.input === 'birthDate'
      ) {
        updatedValidities = {
          ...state.inputValidities,
          [action.input]: action.isValid,
        }
      }

      let updatedTouches = state.inputTouches
      if (action.input === 'firstName' || action.input === 'lastName' || action.input === 'birthDate') {
        updatedTouches = {
          ...state.inputTouches,
          [action.input]: action.isTouched,
        }
      }

      let updatedFormIsValid = true
      for (const key in updatedValidities) {
        updatedFormIsValid = updatedFormIsValid && updatedValidities[key]
      }

      return {
        inputValues: updatedValues,
        inputValidities: updatedValidities,
        inputTouches: updatedTouches,
        formIsValid: updatedFormIsValid,
      }

    case RESET_BIRTH_DATE:
      updatedFormIsValid
      return {
        ...state,
        inputValues: {
          ...state.inputValues,
          birthDate: '',
        },
        inputValidities: {
          ...state.inputValidities,
          birthDate: false,
        },
        formIsValid: false,
      }

    case RESET_STATE:
      return {
        inputValues: {
          lastName: '',
          firstName: '',
          thirdName: '',
          birthDate: '',
          gender: undefined,
          status: 0,
          sms: false,
        },
        inputValidities: {
          lastName: false,
          firstName: false,
          thirdName: true,
          birthDate: false,
        },
        inputTouches: {
          lastName: false,
          firstName: false,
          birthDate: false,
        },
        formIsValid: false,
        loading: false,
        ok: undefined,
      }

    case SET_LOADING:
      return {
        ...state,
        loading: action.loading,
      }

    case SET_MODAL:
      return {
        ...state,
        ok: action.ok,
      }

    default:
      return state
  }
}

export default function App() {
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      lastName: '',
      firstName: '',
      thirdName: '',
      birthDate: '',
      gender: undefined,
      status: 0,
      sms: false,
    },
    inputValidities: {
      lastName: false,
      firstName: false,
      thirdName: true,
      birthDate: false,
    },
    inputTouches: {
      lastName: false,
      firstName: false,
      birthDate: false,
    },
    formIsValid: false,
    loading: false,
    ok: undefined,
  })

  const { firstName, lastName, thirdName, birthDate, gender, status, sms } = formState.inputValues
  const {
    firstName: firstNameValid,
    lastName: lastNameValid,
    thirdName: thirdNameValid,
    birthDate: birthDateValid,
  } = formState.inputValidities
  const { firstName: firstNameToched, lastName: lastNameToched, birthDate: birthDateTouched } = formState.inputTouches

  // Handlers -->
  function inputChangeHandler(inputIdentifier, inputValue) {
    let isValid = false
    let isTouched = false

    // Validate lastName & firstName
    if (inputIdentifier === 'lastName' || inputIdentifier === 'firstName') {
      isTouched = true
      if (inputValue.length !== 0 && inputValue.length < 101) {
        isValid = true
      }
    }

    // Validate thirdName
    if (inputIdentifier === 'thirdName') {
      if (inputValue.length < 101) {
        isValid = true
      } else {
        isValid = false
      }
    }

    // validate birthdate
    if (inputIdentifier === 'birthDate') {
      isTouched = true
      if (Date.parse(inputValue) < Date.parse(new Date()) - 1000 * 60 * 60 * 24) {
        isValid = true
      }
    }

    dispatchFormState({
      type: SET_FORM,
      input: inputIdentifier,
      value: inputValue,
      isValid,
      isTouched,
    })
  }

  function nameFilterHandler(inputIdentifier, text) {
    text = text.toString().trim().replace(/\d/g, '')
    inputChangeHandler(inputIdentifier, text)
  }

  async function submitHandler() {
    let body = {
      lastName,
      firstName,
      thirdName,
      birthDate: birthDate.split('T')[0],
      gender,
      status,
      sms,
    }
    try {
      dispatchFormState({ type: SET_LOADING, loading: true })
      let uri = 'https://622f121d-5f5c-452f-afa7-7787dd15f8c8.mock.pstmn.io/client'

      let headers = { 'Content-Type': 'application/json' }
      const response = await axios.post(uri, body, headers)

      dispatchFormState({ type: RESET_STATE })
      dispatchFormState({ type: SET_LOADING, loading: false })
      dispatchFormState({ type: SET_MODAL, ok: true })
    } catch (error) {
      dispatchFormState({ type: SET_LOADING, loading: false })
      dispatchFormState({ type: SET_MODAL, ok: false })
      dispatchFormState({ type: SET_MODAL, ok: undefined })
    }
  }
  console.log('formState.ok', formState.ok)

  function handleResetBirthDate() {
    dispatchFormState({ type: RESET_BIRTH_DATE })
  }

  function handleResetForm() {
    dispatchFormState({ type: RESET_STATE })
  }

  function handleClearInput(inputIdentifier) {
    inputChangeHandler(inputIdentifier, '')
  }
  // <-- Handlers

  // DatePicker -->
  function onChange(event, selectedDate) {
    const currentDate = selectedDate.toISOString()
    inputChangeHandler('birthDate', currentDate)
  }
  function showDatepicker() {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange,
      mode: 'date',
    })
  }
  // <-- DatePicker

  const refFirstNameInput = useRef()
  const refThirdNameInput = useRef()

  return (
    <>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles().center}>
          <Text>* ??? ???????????????????????? ????????</Text>
          {/* Last Name */}
          <View style={styles().wrapper}>
            <TextInput
              label={'?????????????? *'}
              value={() => lastName}
              onChangeText={nameFilterHandler.bind(this, 'lastName')}
              onBlur={() => inputChangeHandler('lastName', lastName)}
              error={lastNameValid ? false : lastNameToched ? true : false}
              mode="outlined"
              returnKeyType="next"
              onSubmitEditing={() => {
                refFirstNameInput.current.focus()
              }}
              right={
                <TextInput.Icon
                  name={() => (lastName ? <MaterialCommunityIcons name="close" color="#000" size={20} /> : null)}
                  onPress={() => handleClearInput('lastName')}
                />
              }
            />
          </View>
          {/* Error */}
          {lastName.length > 100 ? (
            <Error text="????????. 100 ????????????????!" />
          ) : lastNameValid ? null : lastNameToched ? (
            <Error text="???????????????????? ???????????? ??????????????!" />
          ) : null}
          {/* First Name */}
          <View style={styles().wrapper}>
            <TextInput
              label={'?????? *'}
              value={() => firstName}
              onChangeText={nameFilterHandler.bind(this, 'firstName')}
              onBlur={() => inputChangeHandler('firstName', firstName)}
              error={firstNameValid ? false : firstNameToched ? true : false}
              mode="outlined"
              ref={refFirstNameInput}
              returnKeyType="next"
              onSubmitEditing={() => {
                refThirdNameInput.current.focus()
              }}
              right={
                <TextInput.Icon
                  name={() => (firstName ? <MaterialCommunityIcons name="close" color="#000" size={20} /> : null)}
                  onPress={() => handleClearInput('firstName')}
                />
              }
            />
          </View>
          {/* Error */}
          {firstName.length > 100 ? (
            <Error text="????????. 100 ????????????????!" />
          ) : firstNameValid ? null : firstNameToched ? (
            <Error text="???????????????????? ???????????? ??????!" />
          ) : null}
          {/* Third name */}
          <View style={styles().wrapper}>
            <TextInput
              label={'????????????????'}
              value={() => thirdName}
              onChangeText={nameFilterHandler.bind(this, 'thirdName')}
              mode="outlined"
              ref={refThirdNameInput}
              right={
                <TextInput.Icon
                  name={() => (thirdName ? <MaterialCommunityIcons name="close" color="#000" size={20} /> : null)}
                  onPress={() => handleClearInput('thirdName')}
                />
              }
            />
          </View>
          {/* Error */}
          {thirdNameValid ? null : <Error text="????????. 100 ????????????????!" />}
          {/* DATE */}
          <View style={[styles().wrapper, styles().rowCenter]}>
            <Text style={styles().title}>???????? ???????????????? *: </Text>
            <Text style={styles(birthDateValid).textBirthDate}>
              {!birthDate.length ? '' : birthDateValid ? birthDate?.split('T')[0] : '???????????????? ????????!'}
            </Text>
            <TouchableOpacity onPress={showDatepicker}>
              <MaterialCommunityIcons name="calendar" color={'#000'} size={25} style={{ marginHorizontal: 5 }} />
            </TouchableOpacity>
            {birthDate ? (
              <TouchableOpacity onPress={handleResetBirthDate}>
                <MaterialCommunityIcons name="close-thick" size={20} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Error */}
          {!birthDateValid && birthDate.length ? (
            <Error date text="??????, ??* **** ????????, ?????????? ???????? ?? ?????? 2019!" />
          ) : birthDateValid ? null : birthDateTouched ? (
            <Error date text="???????????????????? ?????????????? ???????? ????????????????!" />
          ) : null}
          <Divider />
          {/* GENDER */}
          <View style={styles().gender}>
            <Text style={styles().title}>??????:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton
                value={'m'}
                status={gender === 1 ? 'checked' : 'unchecked'}
                onPress={inputChangeHandler.bind(null, 'gender', 1)}
              />
              <Text style={styles().text}>??????????????</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton
                value={'f'}
                status={gender === 0 ? 'checked' : 'unchecked'}
                onPress={inputChangeHandler.bind(null, 'gender', 0)}
              />
              <Text style={styles().text}>??????????????</Text>
            </View>
          </View>
          <Divider />

          {/* SELECTOR */}
          <View style={styles().selectorWrapper}>
            <Text style={styles().title}>???????????? ????????????????:</Text>
            <Picker
              selectedValue={formState.inputValues.status}
              onValueChange={itemValue => inputChangeHandler('status', itemValue)}>
              <Picker.Item label="-- ???????????????? ???????????? ???????????????? --" value={0} />
              <Picker.Item label="VIP" value={1} />
              <Picker.Item label="????????????????????" value={2} />
              <Picker.Item label="??????" value={3} />
            </Picker>
          </View>
          <Divider />

          {/* SMS */}
          <View style={[styles().wrapper, styles().rowCenter]}>
            <Checkbox status={sms ? 'checked' : 'unchecked'} onPress={() => inputChangeHandler('sms', !sms)} />
            <Text style={styles().text}>?????????????????????? ???? ??????</Text>
          </View>

          {/*  BTN SEND */}
          <Button
            style={styles().btnReg}
            mode="contained"
            onPress={submitHandler}
            disabled={!formState.formIsValid}
            loading={formState.loading}>
            ????????????????????????????????
          </Button>

          {/* BTN CLEAR */}
          <Button
            mode="text"
            onPress={handleResetForm}
            disabled={!(lastName || firstName || thirdName || birthDate || gender || status || sms)}>
            ???????????????? ??????????
          </Button>
        </View>
        <ModalPopup ok={formState.ok} />
      </ScrollView>
    </>
  )
}

const styles = birthDateValid =>
  StyleSheet.create({
    scrollView: { flex: 1 },
    center: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 10,
    },
    wrapper: {
      width: windowWidth * 0.9,
      marginVertical: 10,
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontWeight: 'bold',
      fontSize: 15,
    },
    textBirthDate: {
      fontSize: 15,
      color: birthDateValid ? '#000' : 'red',
    },
    text: {
      fontSize: 15,
    },
    gender: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      width: windowWidth * 0.9,
      marginVertical: 10,
    },
    selectorWrapper: {
      width: windowWidth * 0.9,
      height: windowWidth * 0.15,
      marginVertical: 20,
    },
    btnReg: {
      marginVertical: 15,
    },
  })
