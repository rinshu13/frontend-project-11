const parseRSS = (response) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(response.data.contents, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('invalid-rss')
  }

  const title = doc.querySelector('title')?.textContent || ''
  const description = doc.querySelector('description')?.textContent || ''

  const items = [...doc.querySelectorAll('item')].map(item => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || '',
  }))

  return { title, description, items }
}

export default parseRSS
