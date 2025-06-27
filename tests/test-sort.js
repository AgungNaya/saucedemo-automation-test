import { Builder, By, until } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import assert from 'assert';
import { Select } from 'selenium-webdriver/lib/select.js'; 
import fs from 'fs';
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import PageLogin from '../pages/page_login.js';


describe('SauceDemo Test - Login and Sort A-Z', function () {
    this.timeout(30000); 

    let driver;

    beforeEach(async () => {
        const options = new firefox.Options();
        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
        await driver.get('https://www.saucedemo.com');

        if (!fs.existsSync('screencapture')) {
            fs.mkdirSync('screencapture');
        }
    });

    afterEach(async () => {
        await driver.quit();
    });

    it('should login successfully and sort products A-Z', async () => {
        //Login POM
        await PageLogin.login(driver, 'standard_user', 'secret_sauce');

        await driver.wait(until.urlContains('inventory.html'), 10000);
        await driver.wait(until.elementLocated(By.className('inventory_list')), 10000);
        //Visual testing
        let ss_redirect = await driver.takeScreenshot();
        fs.writeFileSync('screencapture/current.png', Buffer.from(ss_redirect, 'base64'));

        if (!fs.existsSync("screencapture/baseline.png")) {
            fs.copyFileSync("screencapture/current.png", "screencapture/baseline.png");
            console.log("Baseline image saved.")
        }

        let img1 = PNG.sync.read(fs.readFileSync("screencapture/baseline.png"));
        let img2 = PNG.sync.read(fs.readFileSync("screencapture/current.png"));
        let { width, height } = img1;
        let diff = new PNG({ width, height});

        let numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1});
        fs.writeFileSync("screencapture/diff.png", PNG.sync.write(diff));

        if (numDiffPixels > 0) {
            console.log(`Visual differences found! Pixels different: ${numDiffPixels}`);
        } else {
            console.log("No visual differences found.");
        }

        let ss_loginRedirect = await driver.takeScreenshot();
        fs.writeFileSync('screencapture/ss_login_redirect_inventory_page.png', Buffer.from(ss_loginRedirect, 'base64'));

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
        //Login POM
        await PageLogin.login(driver, 'locked_out_user', 'secret_sauce');
        
        // element eror
        const errorElement = await driver.wait(
            until.elementLocated(By.css('[data-test="error"]')),
            6000
        );

        //assert
        const errorText = (await errorElement.getText()).trim();
        assert.strictEqual(errorText, "Epic sadface: Sorry, this user has been locked out.");
        //screenshot
        let ss_errorText = await errorElement.takeScreenshot();
        fs.writeFileSync('screencapture/ss_errorText.png', Buffer.from(ss_errorText, 'base64'));

        await driver.sleep(1700)
    });


    it.skip('Check saucedemo availabilty', async function () {
        const options = new firefox.Options();
        options.addArguments("--headless");

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();
    });
});
