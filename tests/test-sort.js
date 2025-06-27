const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const assert = require('assert');
const { Select } = require('selenium-webdriver/lib/select'); 
const fs = require('fs');

describe('SauceDemo Test - Login and Sort A-Z', function () {
    this.timeout(30000); 

    let driver;

    beforeEach(async () => {
        driver = await new Builder().forBrowser('firefox').build();
        await driver.get('https://www.saucedemo.com')
    });

    afterEach(async () => {
        await driver.quit();
    });

    it('should login successfully and sort products A-Z', async () => {
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await driver.findElement(By.id('login-button')).click();

        await driver.wait(until.urlContains('inventory.html'), 10000);
        await driver.wait(until.elementLocated(By.className('inventory_list')), 10000);

        driver.takeScreenshot().then(function(data){
            fs.writeFileSync('screenshot.png', data, 'base64');
        });

        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('inventory.html'), 'Login failed and the User was not redirected to inventory page');

        const sortDropdown = await driver.findElement(By.css('[data-test="product-sort-container"]'));
        assert.strictEqual(await sortDropdown.isDisplayed(), true, 'The Sorting Dropdown is not visible');
        const select = new Select(sortDropdown); 
        await select.selectByVisibleText('Name (A to Z)');

        await driver.wait(async () => {
            const firstItem = await driver.findElement(By.css('.inventory_item_name')).getText();
            return firstItem === 'Sauce Labs Backpack';
        }, 5000);

        const nameElements = await driver.findElements(By.className('inventory_item_name'));
        const productNames = [];

        for (let el of nameElements) {
            productNames.push(await el.getText());
        }
        const sortedNames = [...productNames].sort();
        assert.deepStrictEqual(productNames, sortedNames, 'Products are not sorted from A to Z');
    });
     it('Login with locked_out_user', async function () {
        const options = new firefox.Options();
        options.addArguments("--headless");

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        // assert: memastikan object sama persis
        assert.strictEqual(title, 'Swag Labs');

        // inputs
        let inputUsername = await driver.findElement(By.css('[data-test="username"]'))
        let inputPassword = await driver.findElement(By.xpath('//*[@data-test="password"]'))
        let buttonLogin = await driver.findElement(By.className('submit-button btn_action'))
        await inputUsername.sendKeys('locked_out_user')
        await inputPassword.sendKeys('secret_sauce')
        await buttonLogin.click()
        
        // element eror
        const errorElement = await driver.wait(
            until.elementLocated(By.css('[data-test="error"')),
            6000
        );

        //assert
        const errorText = (await errorElement.getText()).trim();
        assert.strictEqual(errorText, "Epic sadface: Sorry, this user has been locked out.");
        
        await driver.sleep(1700)
    });


    it.skip('Check saucedemo availabilty', async function () {
        const options = new firefox.Options();
        options.addArguments("--headless");

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();
    });
});
