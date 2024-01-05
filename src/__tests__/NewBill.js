/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor, createEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js";

jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  jest.spyOn(mockStore, 'bills')
  Object.defineProperty(
    window,
    'localStorage',
    { value: localStorageMock }
  )
  window.localStorage.setItem('user', JSON.stringify({
    type:"Employee",
    email:"a@a",
  }))
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render NewBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const newBill = new NewBill({
        document,
        onNavigate: () => {},
        firestore: mockStore,
        localStorage: window.localStorage,
      })

      expect(newBill).toBeTruthy()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page and I submit a valid form", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills')
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type:"Employee",
          email:"a@a",
        }))
      })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = mockStore
        const newBill = new NewBill({
          document,
          onNavigate,
          firestore,
          localStorage: window.localStorage,
        })
        const form = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn(newBill.handleSubmit)
        form.addEventListener('submit', handleSubmit)
        fireEvent.submit(form)
        test("Then it should create a new bill", () => {
          expect(handleSubmit).toHaveBeenCalled()
        })
  })

  describe("When I send a file with a valid extension", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const html = NewBillUI()
    document.body.innerHTML = html
    Object.defineProperty(
      window,
      'localStorage',
      { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type:"Employee",
      email:"a@a"})
      )
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore:mockStore,
        localStorage: window.localStorage,
      })
      
      const file = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      file.addEventListener('change', handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' })],
        },
      })
      test("Then file input should contain the file", () => {
      expect(handleChangeFile).toHaveBeenCalled()
      expect(file.files[0].name).toBe('image.jpg')
    })
  })

  describe("When I upload a file with handleChangeFile and the file has an invalid extension", () => {
    test("Then it should display an error message and reset the file input value", () => {
      // Given
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = () => {}
      const firestore = {
        bills: () => ({ post: jest.fn(), create: jest.fn() })
      }
      const localStorage = window.localStorage
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      })
      const input = screen.getByTestId('file')

      // When
      const mockChangeEvent = createEvent.change(input, {
        target: { files: [new File(['file'], 'file.txt', { type: 'text/plain' })] },
      })
      fireEvent(input, mockChangeEvent)

      // Then
      const errorMsg = screen.getByTestId('error-msg')
      expect(errorMsg.textContent).toBe('Type de fichier non autorisé')
      expect(input.value).toBe('')
    })
  })

  describe("When I submit the form with valid data", () => {
    test("Then it should call updateBill with the right data", () => {
      // Given
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = () => {}
      const firestore = {
        bills: () => ({ post: jest.fn(), create: jest.fn() })
      }
      const localStorage = window.localStorage
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      })
      const form = screen.getByTestId('form-new-bill')
      const updateBill = jest.fn(newBill.updateBill)
      newBill.updateBill = updateBill

      // When
      const mockSubmitEvent = createEvent.submit(form)
      fireEvent(form, mockSubmitEvent)

      // Then
      const expectedBill = {
        email: JSON.parse(localStorage.getItem("user")).email,
        type: form.querySelector(`select[data-testid="expense-type"]`).value,
        name: form.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(form.querySelector(`input[data-testid="amount"]`).value),
        date: form.querySelector(`input[data-testid="datepicker"]`).value,
        vat: form.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(form.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: form.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: newBill.fileUrl,
        fileName: newBill.fileName,
        status: 'pending'
      }
      expect(updateBill).toHaveBeenCalledWith(expectedBill)
    })
  })
})