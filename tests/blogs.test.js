const Page = require('./helpers/page');

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto('http://localhost:3000');
});

afterEach(async () => {
	await page.close();
});

describe('When user logged in', () => {
	beforeEach(async () => {
		await page.login();
		await page.click('a.btn-floating');
	});

	test('Show form when click red button', async () => {
		const label = await page.getContentsOf('form label');

		expect(label).toEqual('Blog Title');

	});

	describe('And using invalid inputs', () => {
		beforeEach(async () => {
			await page.click('form button');
		});

		test('shows error messages', async () => {
			const titleError = await page.getContentsOf('.title .red-text');
			const contentError = await page.getContentsOf('.content .red-text');

			expect(titleError).toEqual('You must provide value');
			expect(contentError).toEqual('You must provide value');
		});
	});

	describe('And using valid inputs', () => {
		const inputTitle = 'My title';
		const inputContent = 'My content';

		beforeEach(async () => {
			await page.type('.title input', inputTitle);
			await page.type('.content input', inputContent);
			await page.click('form button');
		});

		test('Submitting takes user to review screen', async () => {
			const text = await page.getContentsOf('h5');

			expect(text).toEqual('Please confirm your entries');
		});

		test('Submitting then saving takes user to index page', async () => {
			await page.click('button.green');
			await page.waitFor('.card');

			const title = await page.getContentsOf('.card .card-title');
			const content = await page.getContentsOf('.card p');

			expect(title).toEqual(inputTitle);
			expect(content).toEqual(inputContent);
		});

	});
});

describe('User is not logged in', () => {
	test('User cannot create blog posts', async () => {
		const result = await page.evaluate(() => {
			return fetch('/api/blogs', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ title: 'Title', content: 'Content' })
			}).then(res => res.json());
		});

		expect(result).toEqual({ error: 'You must log in' });
	});

	test('User cannot get list of posts', async () => {
		const result = await page.evaluate(() => {
			return fetch('/api/blogs', {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res => res.json());
		});

		expect(result).toEqual({ error: 'You must log in' });
	});
});