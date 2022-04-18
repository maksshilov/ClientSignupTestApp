import React, { useReducer, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native'
import { Button, Checkbox, RadioButton, TextInput } from 'react-native-paper'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
// src
import { windowWidth } from './src/styles/variables'
import ModalPopup from './src/components/Modal'
import Error from './src/components/Error'
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
      if (action.input === 'firstName' || action.input === 'lastName' || action.input === 'birthDate') {
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
  const { firstName: firstNameValid, lastName: lastNameValid, birthDate: birthDateValid } = formState.inputValidities
  const { firstName: firstNameToched, lastName: lastNameToched, birthDate: birthDateTouched } = formState.inputTouches

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
      if (inputValue.length !== 0 && inputValue.length < 101) {
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

  // replace number and spaces from names
  function nameFilterHandler(inputIdentifier, text) {
    text = text.toString().trim().replace(/\d/g, '')
    inputChangeHandler(inputIdentifier, text)
  }

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
    }
  }

  function handleResetBirthDate() {
    dispatchFormState({ type: RESET_BIRTH_DATE })
  }

  function handleResetForm() {
    dispatchFormState({ type: RESET_STATE })
  }

  function handleClearInput(inputIdentifier) {
    inputChangeHandler(inputIdentifier, '')
  }

  const refFirstNameInput = useRef()
  const refThirdNameInput = useRef()

  return (
    <>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles.center}>
          <Text>* — обязательные поля</Text>
          {/* Last Name */}
          <View style={styles.wrapper}>
            <TextInput
              label={'Фамилия *'}
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
          {lastNameValid ? null : lastNameToched ? <Error text="Необходимо ввести фамилию!" /> : null}
          {/* First Name */}
          <View style={styles.wrapper}>
            <TextInput
              label={'Имя *'}
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
          {firstNameValid ? null : firstNameToched ? <Error text="Необходимо ввести имя!" /> : null}
          {/* Third name */}
          <View style={styles.wrapper}>
            <TextInput
              label={'Отчество'}
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
          {/* DATE */}
          <View style={[styles.wrapper, styles.rowCenter]}>
            <Text style={styles.title}>День рождения *: </Text>
            <Text style={styles.text}>
              {!birthDate.length ? '' : birthDateValid ? birthDate?.split('T')[0] : 'Неверная дата!'}
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
          {birthDateValid ? null : birthDateTouched ? <Error text="Необходимо указать дату рождения!" /> : null}

          {/* GENDER */}
          <View style={styles.gender}>
            <Text style={styles.title}>Пол:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton
                value={'m'}
                status={gender === 1 ? 'checked' : 'unchecked'}
                onPress={inputChangeHandler.bind(null, 'gender', 1)}
              />
              <Text style={styles.text}>Мужской</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton
                value={'f'}
                status={gender === 0 ? 'checked' : 'unchecked'}
                onPress={inputChangeHandler.bind(null, 'gender', 0)}
              />
              <Text style={styles.text}>Женский</Text>
            </View>
          </View>
          {/* SELECTOR */}
          <View style={styles.selectorWrapper}>
            <Text style={styles.title}>Группа клиентов</Text>
            <Picker
              selectedValue={formState.inputValues.status}
              onValueChange={itemValue => inputChangeHandler('status', itemValue)}>
              <Picker.Item label="-- выберите группу клиентов --" value={0} />
              <Picker.Item label="VIP" value={1} />
              <Picker.Item label="Проблемные" value={2} />
              <Picker.Item label="ОМС" value={3} />
            </Picker>
          </View>
          {/* SMS */}
          <View style={[styles.wrapper, styles.rowCenter]}>
            <Checkbox status={sms ? 'checked' : 'unchecked'} onPress={() => inputChangeHandler('sms', !sms)} />
            <Text style={styles.text}>Уведомления по СМС</Text>
          </View>
          {/*  BTN SEND */}
          <Button
            style={styles.btnReg}
            mode="contained"
            onPress={submitHandler}
            disabled={!formState.formIsValid}
            loading={formState.loading}>
            Зарегистрировать
          </Button>
          <Button
            mode="text"
            onPress={handleResetForm}
            disabled={!(lastName || firstName || thirdName || birthDate || gender || status || sms)}
            loading={formState.loading}>
            Очистить форму
          </Button>
        </View>
        <ModalPopup ok={formState.ok} />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
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
    marginBottom: 15,
  },
})
