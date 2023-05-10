const { Builder, By, until } = require('selenium-webdriver');
require('geckodriver');

const fileUnderTest = 'file://' + __dirname.replace(/ /g, '%20') + '/../dist/index.html';
const defaultTimeout = 10000;
let driver;
jest.setTimeout(1000 * 60 * 5); // 5 minuter

// Det här körs innan vi kör testerna för att säkerställa att Firefox är igång
beforeAll(async () => {
console.log(fileUnderTest);
    driver = await new Builder().forBrowser('firefox').build();
    await driver.get(fileUnderTest);
});

// Allra sist avslutar vi Firefox igen
afterAll(async() => {
    await driver.quit();
}, defaultTimeout);

test('The stack should be empty in the beginning', async () => {
	let stack = await driver.findElement(By.id('top_of_stack')).getText();
	expect(stack).toEqual("n/a");
});

describe('Clicking "Pusha till stacken"', () => {
	it('should open a prompt box', async () => {
		let push = await driver.findElement(By.id('push'));
		await push.click();
		let alert = await driver.switchTo().alert();
		await alert.sendKeys("Bananer");
		await alert.accept();
	});
});

/* Första testfall som testar om alert box kommer om man lägger en script kod som ger alert i input field
    XSS-skript relaterat
*/

test("The what is ontop of stack should return alert box", async () => {

    const pushElement = await driver.findElement(By.id('push'));
    await pushElement.click();

    await driver.wait(until.alertIsPresent());
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();

    expect(alertText).toEqual('Vad ska vi lägga på stacken?');

    // Skript kod som gör att en alert meddelande (1) visas
    await alert.sendKeys('<img src onerror=alert(1)>');
    await alert.accept();

    await driver.wait(until.alertIsPresent());
    const newAlert = await driver.switchTo().alert();
    const newalertText = await newAlert.getText();
    
    // Expected True om talet är samma som 1
    expect(newalertText).toEqual('1');
})