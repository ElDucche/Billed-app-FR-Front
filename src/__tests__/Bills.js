/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor,} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";

// jest.mock("../app/store", () => mockStore)
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I navigate to Bills", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
      test("fetches bills from mock API GET", async () => {
        const bill = new Bills({
          document,
          localStorage: window.localStorage,
          onNavigate,
          store: mockStore,
        });
        const data = await bill.getBills()
        expect(data.length).toBe(4)
      })
      // test("fetches bills from an API and fails with 404 message error", async () => {
      //  mockStore.bills().mockImplementationOnce(() => {
      //     return {
      //       list : () =>  {
      //         return Promise.reject(new Error("Erreur 404"))
      //       }
      //     }})
      //   window.onNavigate(ROUTES_PATH.Bills)
      //   await new Promise(process.nextTick);
      //   const message = await screen.getByText(/Erreur/)
      //   expect(message).toBeTruthy()
      // })
    })

    describe("When I click on the eye icon", () => {
      test("Then a modal should open", () => {
        // Arrange
        document.body.innerHTML = BillsUI({ data: bills })
        const bill = new Bills({ document, onNavigate: jest.fn(), firestore: null, localStorage: window.localStorage })
        const eye = screen.getAllByTestId('icon-eye')[0]
        const modal = screen.getByTestId('modaleFile')
      
        // Mock jQuery's modal function
        $.fn.modal = jest.fn()
      
        const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eye))
        eye.addEventListener('click', handleClickIconEye)
      
        // Act
        fireEvent.click(eye)
      
        // Assert
        expect(handleClickIconEye).toHaveBeenCalled()
        expect($.fn.modal).toHaveBeenCalledWith('show')
      })
    })
    describe("When I click on the new bill button", () => {
      test("Then it should render the NewBill page", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const bill = new Bills({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store: null,
      });
      // Arrange
      document.body.innerHTML = BillsUI({ data: bills })
      const clickNewBill = jest.fn(() => {bill.handleClickNewBill()})
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', clickNewBill)
  
      // Act
      userEvent.click(newBillButton)
  
      // Assert
      expect(clickNewBill).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId("form-new-bill"));
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
})