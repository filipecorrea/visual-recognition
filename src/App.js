import React, { Component } from 'react'
import {
  Form, TextInput, Select, SelectItem, Button,
  StructuredListWrapper, StructuredListBody, StructuredListRow, StructuredListCell
} from 'carbon-components-react'

const auth = 'Basic ' + Buffer.from(`apikey:${process.env.REACT_APP_API_KEY}`).toString('base64')

class App extends Component {
  constructor () {
    super()

    this.state = { classifiers: [], image: '', model: '', classes: [] }
  }

  componentWillMount () {
    window
      .fetch('classifiers?version=2018-03-19', {
        headers: new global.Headers({ Authorization: auth })
      })
      .then(response => response.json())
      .then(classifiers => this.setState(classifiers))
      .catch(error => console.log(error))
  }

  render () {
    return (
      <div className='bx--grid'>
        <header>
          <h1>Visual Recognition</h1>
        </header>
        <Form onSubmit={(e) => this.submit(e)}>
          <section className='bx--row'>
            <div className='bx--col-xl-8'>
              <TextInput id='image' type='url' required labelText='Image' placeholder='Image URL' />
            </div>
            <div className='bx--col-xs-6 bx--col-xl-3'>
              <Select id='model' labelText='Model' defaultValue='1'>
                <SelectItem value='default' text='Default' />
                {
                  this.state.classifiers.map(classifier => (
                    <SelectItem key={classifier.classifier_id} value={classifier.classifier_id} text={classifier.name} />
                  ))
                }
              </Select>
            </div>
            <div className='bx--col-xs-6 bx--col-xl-1'>
              <Button type='submit'>Submit</Button>
            </div>
          </section>
        </Form>
        {
          this.state.classes.length > 0 &&
            <section className='bx--row'>
              <div className='bx--col-md-12 bx--col-lg-8'>
                <img className='display' src={this.state.image} alt='Placeholder' />
              </div>
              <div className='bx--col-md-12 bx--col-lg-4'>
                <StructuredListWrapper className='result'>
                  <StructuredListBody>
                    {
                      this.state.classes
                        .sort((a, b) => b.score - a.score)
                        .map(result => (
                          <StructuredListRow key={result.class}>
                            <StructuredListCell noWrap>{result.class}</StructuredListCell>
                            <StructuredListCell>{result.score}</StructuredListCell>
                          </StructuredListRow>
                        ))
                    }
                  </StructuredListBody>
                </StructuredListWrapper>
              </div>
            </section>
        }
      </div>
    )
  }

  submit (event) {
    event.preventDefault()

    const image = event.target.image.value
    const model = event.target.model.value

    this.setState({ image })

    window
      .fetch(`classify?version=2018-03-19&url=${image}&classifier_ids=${model}`, {
        method: 'POST',
        headers: new global.Headers({ Authorization: auth })
      })
      .then(response => response.json())
      .then(data => {
        const classes = data.images[0].classifiers[0].classes
        this.setState({ classes })
      })
  }
}

export default App
