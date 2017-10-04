# Benchmarking

## Features

|  **Feature** | **Abstruse** | **Jenkins** |
|---	|---	|---   |
|   Public / Private builds	|  Y 	|  Y	|
|   Public / Private repositories	|  Y 	|   Y	|
|   Integration with Github, Gitlab, Gogs, Bitbucket	|  Y 	|   Y	|
|   SSH mode to access container and make your own investigation	|  Y 	|   N	|
|   Complete solution that needs minimal configuration\adjustments	|  Y 	|   N	|
|   Works on Mac OS X, Windows, Linux	|  Y 	|   Y	|
|   All major programming languages supported	|  Y 	|   Y	|
|   Lightweight, easily readable YAML config	|  Y 	|   N	|
|   Support of build matrix (run tests with different versions of language and packages at the same time)	|  Y 	|   Y	|
|   Statistics for server resource consumption	|  Y 	|   N	|
*Table 1*: Comparison of frequently used features in CI process.

## Resource consumption

### **Running times**

|  **Java-Design-Patterns** | **Total Average** | **Start Build** | **Clone** | **mvn install** | **test** |
|---	|---	|---   |--- |--- |--- |
|   Jenkins	|  4m 27s |  9s	| 21s | 2m 32s | 1m 25s |
|   Abstruse	|  3m 18s |  1s | 15s |  2m 14s | 49s |

|  **Angular build** | **Total Average** | **Start Build** | **Clone** | **npm install** | **build** |
|---	|---	|---   |--- |--- |--- |
|   Jenkins	|  3m 10s |  30s | 44s | 14s | 1m 42s |
|   Abstruse	|  2m 30s |  1s | 32s |  18s | 1m 41s |

|  **Angular test 1** | **Total Average** | **Start Build** | **Clone** | **npm install** | **test** |
|---	|---	|---   |--- |--- |--- |
|   Jenkins	|  5m 13s |  32s | 47s | 15s | 3m 39s |
|   Abstruse	|  4m 53s |  1s | 30s |  18s | 4m 5s |

|  **Angular test 2** | **Total Average** | **Start Build** | **Clone** | **npm install** | **test** |
|---	|---	|---   |--- |--- |--- |
|   Jenkins	|  7m 36s |  29s | 48s | 17s | 5m 59s |
|   Abstruse	|  5m 55s |  1s | 43s |  17s | 4m 52s |

|  **D3-bundle** | **Total Average** | **Start Build** | **Clone** | **npm install** | **test** |
|---	|---	|---   |--- |--- |--- |
|   Jenkins	|  54s |  18s | 27s | 7s | 1s |
|   Abstruse	|  33s |  1s | 26s |  5s | 1s |
*Table 2*: Execution time.

### **CPU and Memory consumption**

<p align="center">
  <img src="https://user-images.githubusercontent.com/3041169/31200826-a2b4292c-a95c-11e7-8d73-c395f7b37355.jpg">
</p>

*Figure 1*: Testing Java-Design-Patterns 1.17.0 with Abstruse (left) and Jenkins (right).

<p align="center">
  <img src="https://user-images.githubusercontent.com/3041169/31200825-a2b3ab3c-a95c-11e7-9d0e-7c48af6730f9.jpg">
</p>

*Figure 2*: Testing Angular 5.0.0-beta.7 with Abstruse (left) and Jenkins (right).

|  **Code Repository** | **Time Savings** | **CPU Savings** | **Memory Savings** |
|---	|---	|---   |--- |
|   [Java-Design-Patterns 1.17.0](https://github.com/iluwatar/java-design-patterns)	|  22.15% |  52.36% | 45.96% |
|   [Angular 5.0.0-beta.7](https://github.com/angular/angular)	|  25.84% |  6.27%	| 35.49% |
*Table 3*: Comparison of time, CPU and memory savings when benchmarking Abstruse vs Jenkins.

## Mom's test

We asked our moms to install the server, start the first build and configure auto builds on both Abstruse and Jenkins. This is what they came up with.

|  **Feature** | **Abstruse** | **Jenkins** |
|---	|---	|---   |
|   Server installation	|  5m 10s |  8m 30s	|
|   Start first build	|  5m 10s |   8m |
|   Configure auto builds	|  0s |   45m |
*Table 4*: Approx. time needed for installation, first build and configuring auto builds on both Abstruse and Jenkins.
