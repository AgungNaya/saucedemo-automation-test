//const { By } = require("selenium-webdriver");
import { By } from "selenium-webdriver";

class PageLogin {
    static inputUsername = By.css('[data-test="username"]');
    static inputPassword = By.xpath('//*[@data-test="password"]');
    static buttonLogin = By.className('submit-button btn_action');

    static async login(driver, username, password) {
        await driver.findElement(this.inputUsername).sendKeys(username);
        await driver.findElement(this.inputPassword).sendKeys(password);
        await driver.findElement(this.buttonLogin).click();
    }
}
export default PageLogin;
