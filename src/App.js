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
        <Form onSubmit={event => this.submit(event)}>
          <section className='bx--row'>
            <div className='bx--col-xl-8'>
              <TextInput id='image' type='url' required labelText='Image' placeholder='Image URL' />
            </div>
            <div className='bx--col-xs-6 bx--col-xl-3'>
              <Select id='model' labelText='Model' defaultValue='default'>
                <SelectItem value='default' text='General' />
                <SelectItem value='food' text='Food' />
                <SelectItem value='explicit' text='Explicit' />
                {
                  this.state.classifiers.map(c => (
                    <SelectItem key={c.classifier_id} value={c.classifier_id} text={c.name} />
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
                <img src={this.state.image} alt={this.state.image} />
              </div>
              <div className='bx--col-md-12 bx--col-lg-4'>
                <StructuredListWrapper>
                  <StructuredListBody>
                    {
                      this.state.classes
                        .sort((a, b) => b.score - a.score)
                        .map(c => (
                          <StructuredListRow key={c.class}>
                            <StructuredListCell noWrap>{c.class}</StructuredListCell>
                            <StructuredListCell>{c.score}</StructuredListCell>
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
      .then(({ images }) => this.setState({ classes: images[0].classifiers[0].classes }))
  }
}

export default App
