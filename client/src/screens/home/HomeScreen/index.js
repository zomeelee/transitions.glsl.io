/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var BezierEasing = require("bezier-easing");
var NumberInput = require("../../../ui/NumberInput");
var BezierEditor = require("../../../ui/BezierEditor");
var Slideshow = require("../../../ui/Slideshow");
var GLSLio = require("../../../ui/Logo");
var Link = require("../../../ui/Link");
var Button = require("../../../ui/Button");
var Pager = require("../../gallery/TransitionsBrowserPager");
var Fps = require("../../editor/Fps");
var app = require("../../../core/app");

var Blockquote = React.createClass({
  render: function () {
    return <blockquote>
      {this.props.children}
      <cite>
        <Link href={this.props.href} target="_blank">
          {this.props.author}
        </Link>
      </cite>
    </blockquote>;
  }
});

var Slider = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number.isRequired,
    unit: React.PropTypes.string,
    step: React.PropTypes.number,
    min: React.PropTypes.number,
    max: React.PropTypes.number
  },
  getDefaultProps: function () {
    return {
      unit: "",
      step: 1,
      min: 0,
      max: 100
    };
  },
  onChange: function (i) {
    this.props.onChange(parseFloat(i.target.value, 10));
  },
  render: function () {
    return <div className="slider">
      <strong>{this.props.title}:</strong>
      <span className="value">{this.props.value+this.props.unit}</span>
      <NumberInput onChange={this.onChange} type="range" step={this.props.step} min={this.props.min} max={this.props.max} value={this.props.value} />
    </div>;
  }
});

var HomeScreen = React.createClass({

  propTypes: {
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    images: React.PropTypes.array.isRequired,
    page: React.PropTypes.number
  },

  randomize: function () {
    this.setState({
      videoTransition: this.props.transitions[Math.floor(Math.random()*this.props.transitions.length)]
    });
  },

  getInitialState: function () {
    return {
      page: this.props.page||0,
      fps: null,
      videoTransition: this.props.transitions[Math.floor(Math.random()*this.props.transitions.length)],
      easing: [0.25, 0.25, 0.75, 0.75],
      duration: 1500,
      flyEyeTransition: {
        "id":"81c6f2e6fce88f9075d2","owner":"gre","html_url":"https://gist.github.com/81c6f2e6fce88f9075d2","created_at":"2014-05-16T13:56:53Z","updated_at":"2014-05-16T13:58:00Z","name":"flyeye","glsl":"#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress,size,zoom,colorSeparation;uniform vec2 resolution;void main(){vec2 a,c;a=gl_FragCoord.xy/resolution.xy;float b=1.-progress;c=size*vec2(cos(zoom*a.x),sin(zoom*a.y));vec4 d,e;d=texture2D(to,a+b*c);e=vec4(texture2D(from,a+progress*c*(1.-colorSeparation)).r,texture2D(from,a+progress*c).g,texture2D(from,a+progress*c*(1.+colorSeparation)).b,1);gl_FragColor=d*progress+e*b;}","uniforms":{"size":0.04,"zoom":30.0,"colorSeparation":0.3}
      },
      cubeTransition: {
        "id":"ee15128c2b87d0e74dee","owner":"gre","html_url":"https://gist.github.com/ee15128c2b87d0e74dee","created_at":"2014-06-12T17:13:17Z","updated_at":"2014-06-12T17:26:31Z","name":"cube","glsl":"#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress,persp,unzoom,reflection,floating;uniform vec2 resolution;vec2 f(vec2 a){return a*vec2(1,-1.2)+vec2(0,-floating/1e2);}bool g(vec2 a){return all(lessThan(vec2(0),a))&&all(lessThan(a,vec2(1)));}vec4 h(vec2 a,vec2 b,vec2 c){vec4 d=vec4(0,0,0,1);b=f(b);if(g(b))d+=mix(vec4(0),texture2D(from,b),reflection*mix(1.,0.,b.y));c=f(c);if(g(c))d+=mix(vec4(0),texture2D(to,c),reflection*mix(1.,0.,c.y));return d;}vec2 i(vec2 a,float b,float c){float d=mix(a.x,1.-a.x,c);return (vec2(d,(a.y-.5*(1.-b)*d)/(1.+(b-1.)*d))-vec2(.5-distance(c,.5),0))*vec2(.5/distance(c,.5)*(c<.5?1.:-1.),1)+vec2(c<.5?0.:1.,0);}void main(){vec2 a,c,d,e;a=gl_FragCoord.xy/resolution.xy;float b=unzoom*2.*(.5-distance(.5,progress));c=-b*.5+(1.+b)*a;d=i((c-vec2(progress,0))/vec2(1.-progress,1),1.-mix(progress,0.,persp),0.);e=i(c/vec2(progress,1),mix(pow(progress,2.),1.,persp),1.);if(g(d))gl_FragColor=texture2D(from,d);else if(g(e))gl_FragColor=texture2D(to,e);else gl_FragColor=h(a,d,e);}","uniforms":{"persp":0.7,"unzoom":0.3,"reflection":0.4,"floating":3.0}
}
    };
  },

  onSlideChange: function (stats) {
    var fps = stats.frames ? Math.round(1000*stats.frames/stats.elapsedTime) : null;
    if (this.state.fps !== fps) {
      this.setState({ fps: fps });
    }
  },

  onDurationChange: function (duration) {
    this.setState({ duration: duration });
  },

  setEasing: function (easing) {
    this.setState({ easing: easing });
  },

  prev: function () {
    this.goToPage(this.state.page-1);
  },

  next: function () {
    this.goToPage(this.state.page+1);
  },

  goToPage: function (page) {
    app.router.overridesUrl(app.router.url.pathname+"?page="+page);
    this.setState({ page: page });
  },

  goToPageFunction: function (p) {
    return function () {
      this.goToPage(p);
    }.bind(this);
  },

  slideshows: {
    transitions: {
      render: function () {
        return <div>
          <Slideshow width={512} height={384} images={this.props.images} transitions={this.props.transitions} onSlideChange={this.onSlideChange} transitionEasing={BezierEasing.apply(null, this.state.easing)} transitionDuration={this.state.duration} />
          This slideshow shows all transitions created by <GLSLio /> contributors!
        </div>;
      }
    },
    videos: {
      render: function () {
        return <iframe width={512} height={384} src={"/transition/"+this.state.videoTransition.id+"/embed?video=1&autoplay=1&loop=1"} frameBorder="0" seamless="seamless"></iframe>;
      }
    },
    flyEyeTransition: {
      render: function () {
        return <Slideshow width={512} height={384} images={this.props.images} transitions={[this.state.flyEyeTransition]} onSlideChange={this.onSlideChange} transitionEasing={BezierEasing.apply(null, this.state.easing)} transitionDuration={this.state.duration} />;
      }
    },
    cubeTransition: {
      render: function () {
        return <Slideshow width={512} height={384} images={this.props.images} transitions={[this.state.cubeTransition]} onSlideChange={this.onSlideChange} transitionEasing={BezierEasing.apply(null, this.state.easing)} transitionDuration={this.state.duration} />;
      }
    },
    glslio: {
      render: function () {
        return <img src="/assets/glslio_1080p.png" width="512px" height="288px" alt="" />;
      }
    },
    tutos: {
      render: function () {
        return <iframe width="512" height="384" src="//www.youtube.com/embed/videoseries?list=PLe93qXGkp4Vjfu6TZZ24beMBePTCaMebl" frameborder="0" allowfullscreen="allowfullscreen"></iframe>;
      }
    }
  },

  pages: [
    {
      slideshow: "transitions",
      icon: "magic",
      title: "Incredible Effects",
      render: function () {
        return <div>
          <div>
          GLSL is <strong>the</strong> ultimate language to implement Transitions in.
          There is really no limitation on effects you can perform with.
          </div>
          <div>
          <Link href="/gallery">
            <img src="/assets/examples.png" style={{width: "500px"}} alt="" />
          </Link>
          </div>
          <Blockquote href="http://badassjs.com/post/72677810093/glsl-transition-iphoto-like-slideshow-transitions" author="@devongovett">
            <q>
              iPhoto like slideshow transitions using WebGL
            </q>
          </Blockquote>
        </div>;
      }
    },
    {
      slideshow: "transitions",
      icon: "tachometer",
      title: "Highly Performant",
      render: function () {
        return <div>
          <div>
            Incredible Transition Effects running at 60 FPS in your browser.
          </div>
          <div className="highlight">
            The current slideshow transition is running at: <Fps fps={this.state.fps} />
          </div>
          <div>
            The Transitions are implemented in a standard language used by OpenGL / WebGL called
            <strong title="OpenGL Shading Language"> GLSL </strong>
            which directly compiles into the Graphic Card.
          </div>
          <Blockquote href="http://creativejs.com/2014/01/the-last-place-youd-expect-to-see-webgl/" author="@creativejs">
            <q>
              The last place you’d expect to see WebGL
            </q>
          </Blockquote>
        </div>;
      }
    },
    {
      slideshow: "videos",
      icon: "film",
      title: "Multi-media purposes",
      render: function () {
        return <div>
          <div>
            GLSL Transitions focus on defining a transition between 2 sources.
          </div>
          <div>
            <strong>
              These sources can be images, videos or anything 2D!
            </strong>
          </div>
          <div>
            <em>
              On the left side you can see a video example.
            </em>
          </div>
          <br />
          <div className="randomize">
            <Button f={this.randomize}><i className="fa fa-random"></i>&nbsp;Randomize!</Button>
          </div>
          <Blockquote href="https://twitter.com/zeh/status/469854130866245633" author="@zeh">
            <q>
              WebGL/GLSL transitions in your browser. Some of these blow my mind
            </q>
          </Blockquote>
        </div>;
      }
    },
    {
      slideshow: "transitions",
      icon: "puzzle-piece",
      title: "Multi-environnment",
      render: function () {
        return <div>
          <div>
            GLSL can be supported both on Browsers and on Native environnment.
            We are working to make GLSL Transitions working in Video Editors.
          </div>
          <Blockquote href="http://www.geeks3d.com/20140524/glsl-io-a-helpful-collection-of-glsl-transition-effects/" author="@Geeks3D">
            <q>
              A Helpful Collection of GLSL Transition Effects
            </q>
            – proof of native usage
          </Blockquote>
        </div>;
      }
    },
    {
      slideshow: "transitions",
      icon: "cogs",
      title: "Customisable",
      render: function () {
        return <div>
          <div>
          </div>
          <Slider
            onChange={this.onDurationChange}
            value={this.state.duration}
            title="duration"
            min={100}
            max={3000}
            step={50}
            unit="ms" />
          <div>
            <strong>Easing:</strong>
            <div style={{ "textAlign": "center" }}>
              <BezierEditor value={this.state.easing} onChange={this.setEasing} width={250} height={250} handleRadius={8} padding={[30, 30, 30, 30]} />
            </div>
          </div>
        </div>;
      }
    },
    {
      slideshow: "cubeTransition",
      icon: "cogs",
      title: "Much more Customisable !",
      notab: true,
      render: function () {
        var self = this;
        function uniformSetter (u) {
          return function (value) {
            var cubeTransition = _.cloneDeep(self.state.cubeTransition);
            cubeTransition.uniforms[u] = value;
            self.setState({
              cubeTransition: cubeTransition
            });
          };
        }

        return <div>
          <div>
            A transition exposes "uniform" that is helpful to customize the effect parameters.
            Transition Duration and Transition Easing Function are also customisable.
          </div>
          <Slider
            onChange={uniformSetter("persp")}
            value={this.state.cubeTransition.uniforms.persp}
            title="Perspective"
            min={0.0}
            max={1.4}
            step={0.01} />
          <Slider
            onChange={uniformSetter("unzoom")}
            value={this.state.cubeTransition.uniforms.unzoom}
            title="UnZoom"
            min={0.0}
            max={3.0}
            step={0.01} />
          <Slider
            onChange={uniformSetter("reflection")}
            value={this.state.cubeTransition.uniforms.reflection}
            title="Reflection"
            min={0.0}
            max={1.0}
            step={0.01} />
          <Slider
            onChange={uniformSetter("floating")}
            value={this.state.cubeTransition.uniforms.floating}
            title="Floating"
            min={0.0}
            max={10.0}
            step={0.1} />
          <div>
            See <Link href="https://glsl.io/transition/ee15128c2b87d0e74dee">cube</Link>
          </div>
        </div>;
      }
    },
    {
      slideshow: "flyEyeTransition",
      icon: "cogs",
      title: "Much more Customisable !",
      notab: true,
      render: function () {
        var self = this;
        function uniformSetter (u) {
          return function (value) {
            var flyEyeTransition = _.cloneDeep(self.state.flyEyeTransition);
            flyEyeTransition.uniforms[u] = value;
            self.setState({
              flyEyeTransition: flyEyeTransition
            });
          };
        }

        return <div>
          <div>
            A transition exposes "uniform" that is helpful to customize the effect parameters.
            Transition Duration and Transition Easing Function are also customisable.
          </div>
          <Slider
            onChange={uniformSetter("zoom")}
            value={this.state.flyEyeTransition.uniforms.zoom}
            title="Zoom Level"
            min={0}
            max={200}
            step={1} />
          <Slider
            onChange={uniformSetter("size")}
            value={this.state.flyEyeTransition.uniforms.size}
            title="Effect Power"
            min={0.0}
            max={2}
            step={0.01} />
          <Slider
            onChange={uniformSetter("colorSeparation")}
            value={this.state.flyEyeTransition.uniforms.colorSeparation}
            title="Color Separation"
            min={0.0}
            max={1.0}
            step={0.01} />
          <div>
            See <Link href="https://glsl.io/transition/81c6f2e6fce88f9075d2">flyeye</Link>
          </div>
        </div>;
      }
    },
    {
      slideshow: "transitions",
      icon: "cloud-download",
      title: "Easy to use",
      render: function () {
        return <div>
          <div>
            The <Link href="https://github.com/glslio/glsl-transition">glsl-transition</Link> library make GLSL Transitions very easy to use on your webpages.
          </div>
          <div>
            TODO: explain soon more details
          </div>
        </div>;
      }
    },
    {
      slideshow: "glslio",
      icon: "users",
      title: "Community Driven",
      render: function () {

        var contributors = _.chain(this.props.transitions)
          .pluck("owner")
          .foldl(function (all, owner) {
            if (!(owner in all)) all[owner] = 0;
            all[owner] ++;
            return all;
          }, {})
          .pairs()
          .sortBy(1)
          .reverse()
          .object()
          .map(function (count, owner) {
            return <Link href={"/user/"+owner}>{owner} ({count})</Link>;
          })
          .value();

        return <div>
          <div>
            On <GLSLio />,
            GLSL Transitions are created by people, for people.
          </div>
          <br />
          <div>
            Cheers to our current contributors:
            <div className="contributors">{contributors}</div>
          </div>
        </div>;
      }
    },
    {
      slideshow: "glslio",
      icon: "code",
      title: "Free License Transitions",
      render: function () {
        return <div>
          <div>
            All transitions are released under Free License.
            By creating content on <GLSLio />, you accept to release transitions under MIT License.
          </div>
          <br />
          <div>
            The source code of <GLSLio /> itself is also fully available <Link href="https://github.com/">on Github</Link>.
          </div>
        </div>;
      }
    },
    {
      slideshow: "glslio",
      icon: "github-alt",
      title: "Gist Hosted",
      render: function () {
        var rootGistUrl = "https://gist.github.com/"+this.props.env.rootGist;
        return <div>
          <div>
          No data are kept on our server.
          All transitions are stored in Gists and owned by the community.
          </div>
          <br />
          <div>
            Transitions are all forking a same <em> root gist</em>:
            <div>
              <Link href={rootGistUrl}>{rootGistUrl}</Link>
            </div>
          </div>
        </div>;
      }
    },
    {
      slideshow: "tutos",
      icon: "youtube",
      title: "Video Tutorials",
      render: function () {
        return <div>
          <div>
            All our videos are <Link href="https://www.youtube.com/playlist?list=PLe93qXGkp4Vjfu6TZZ24beMBePTCaMebl"> Here</Link>.
          </div>
          <div>
            Get in touch with <GLSLio /> news by  <Link href="https://twitter.com/glslio"> Following us on Twitter</Link>.
          </div>
          <div>
            You can also read the <Link href="/blog"> <GLSLio /> blog</Link>.
          </div>
          <br />

          <div>
            If you want to learn GLSL more deeply, we recommend that you try the 
            <Link href="https://www.npmjs.org/package/shader-school#readme" target="_blank"> <i className="fa fa-graduation-cap"></i>&nbsp;Shader School</Link>.
          </div>
        </div>;
      }
    }
  ],

  render: function () {
    var page = this.pages[this.state.page];
    var slideshow = this.slideshows[page.slideshow].render.call(this);
    var pageContent = page.render.call(this);
    var next = this.state.page+1 < this.pages.length ? this.next : null;
    var prev = this.state.page-1 >= 0 ? this.prev : null;

    var navIcons = this.pages.map(function (p, i) {
      return p.notab ? '' :
      <Button className={page.icon===p.icon ? "current" : ""} title={p.title} f={this.goToPageFunction(i)}>
        <i className={"fa fa-"+p.icon}></i>
      </Button>;
    }, this);

    return <div className="home-screen">

      <div className="visual">
        <h2>
          WebGL Transitions for your images slideshow
        </h2>
        <div>
          {slideshow}
        </div>
      </div>

      <div className="page">
        <nav>
          {navIcons}
        </nav>
        <div className="content">
          <header><i className={"fa fa-"+page.icon}></i> {page.title}</header>
          {pageContent}
        </div>
        <Pager
          page={this.state.page}
          numberOfPages={this.pages.length}
          next={next}
          prev={prev}
          keyboardControls={true}
        />
      </div>

    </div>;
  }

});

module.exports = HomeScreen;

